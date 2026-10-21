import bpy
import math
import os
import sys

argv = sys.argv
argv = argv[argv.index('--') + 1:] if '--' in argv else []
OUT = argv[0] if argv else 'C:/tmp/debug-floor.png'

bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 256
scene.render.resolution_y = 256
scene.view_settings.view_transform = 'Standard'
scene.cycles.samples = 32
scene.cycles.use_denoising = False

print('VIEW_TRANSFORM:', scene.view_settings.view_transform)

bpy.ops.mesh.primitive_plane_add(size=8)
ground = bpy.context.active_object

mat = bpy.data.materials.new('m')
mat.use_nodes = True
bsdf = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
bsdf.inputs['Base Color'].default_value = (0.9, 0.2, 0.1, 1)
bsdf.inputs['Roughness'].default_value = 0.95
ground.data.materials.append(mat)
print('MATERIAL SLOTS:', len(ground.data.materials), 'BASE COLOR:', tuple(bsdf.inputs['Base Color'].default_value))

cam_data = bpy.data.cameras.new('c')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 9.6
cam = bpy.data.objects.new('cam', cam_data)
cam.location = (0, 0, 10)
scene.collection.objects.link(cam)
scene.camera = cam

sun_data = bpy.data.lights.new('s', 'SUN')
sun_data.energy = 5
sun = bpy.data.objects.new('sun', sun_data)
sun.location = (5, -3, 4)
sun.rotation_euler = (math.radians(60), 0, math.radians(40))
scene.collection.objects.link(sun)

scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('RENDERED', OUT)
