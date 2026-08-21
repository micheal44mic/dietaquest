import { FLOATS_PER_PARTICLE, MAX_PARTICLES } from './particles'

const SHADER = /* wgsl */ `
struct Particle {
  pos: vec2f,
  size: f32,
  rot: f32,
  color: vec4f,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> resolution: vec2f;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) color: vec4f,
}

@vertex
fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VSOut {
  var corners = array<vec2f, 6>(
    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0),
  );
  let p = particles[ii];
  let c = corners[vi];
  let cs = cos(p.rot);
  let sn = sin(p.rot);
  let local = vec2f(c.x * cs - c.y * sn, c.x * sn + c.y * cs) * p.size;
  let px = p.pos + local;
  let ndc = vec2f(px.x / resolution.x * 2.0 - 1.0, 1.0 - px.y / resolution.y * 2.0);
  var out: VSOut;
  out.pos = vec4f(ndc, 0.0, 1.0);
  out.uv = c;
  out.color = p.color;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4f {
  let d = length(in.uv);
  let alpha = smoothstep(1.0, 0.6, d) * in.color.a;
  // Alpha premoltiplicato con un tocco di glow al centro
  let glow = smoothstep(0.5, 0.0, d) * 0.35 * in.color.a;
  return vec4f(in.color.rgb * alpha + vec3f(glow), alpha);
}
`

export interface GpuFx {
  render: (data: Float32Array<ArrayBuffer>, count: number, cssW: number, cssH: number) => void
  /** iOS può reclamare il processo GPU in background: allora il device va ricreato */
  readonly lost: boolean
  destroy: () => void
}

export async function createGpuFx(canvas: HTMLCanvasElement): Promise<GpuFx | null> {
  if (!('gpu' in navigator)) return null
  try {
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) return null
    const device = await adapter.requestDevice()
    const ctx = canvas.getContext('webgpu')
    if (!ctx) return null

    let lost = false
    void device.lost.then(() => {
      lost = true
    })

    const format = navigator.gpu.getPreferredCanvasFormat()
    ctx.configure({ device, format, alphaMode: 'premultiplied' })

    const particleBuffer = device.createBuffer({
      size: MAX_PARTICLES * FLOATS_PER_PARTICLE * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    const uniformBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const module = device.createShaderModule({ code: SHADER })
    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module, entryPoint: 'vs' },
      fragment: {
        module,
        entryPoint: 'fs',
        targets: [
          {
            format,
            blend: {
              color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
              alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
            },
          },
        ],
      },
      primitive: { topology: 'triangle-list' },
    })

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: particleBuffer } },
        { binding: 1, resource: { buffer: uniformBuffer } },
      ],
    })

    const uniformData = new Float32Array(4)

    return {
      get lost() {
        return lost
      },
      render(data, count, cssW, cssH) {
        if (lost) return
        if (count > 0) {
          device.queue.writeBuffer(particleBuffer, 0, data, 0, count * FLOATS_PER_PARTICLE)
        }
        uniformData[0] = cssW
        uniformData[1] = cssH
        device.queue.writeBuffer(uniformBuffer, 0, uniformData)

        const encoder = device.createCommandEncoder()
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: ctx.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        })
        if (count > 0) {
          pass.setPipeline(pipeline)
          pass.setBindGroup(0, bindGroup)
          pass.draw(6, count)
        }
        pass.end()
        device.queue.submit([encoder.finish()])
      },
      destroy() {
        if (lost) return
        particleBuffer.destroy()
        uniformBuffer.destroy()
        device.destroy()
      },
    }
  } catch {
    return null
  }
}
