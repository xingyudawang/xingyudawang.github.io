"""
Blender headless script: bake a photoreal sandy cave-floor texture.

Run:  blender --background --python floor.py -- <output.png>
The result replaces the flat canvas gradient on the floor of every 360° cave.
"""
import bpy
import math
import os
import sys

argv = sys.argv
argv = argv[argv.index('--') + 1:] if '--' in argv else []
OUT = argv[0] if argv else os.path.join(os.path.dirname(bpy.data.filepath), 'cave-floor.png')

# ------------------------------------------------------------------ reset
bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.film_transparent = False
scene.view_settings.view_transform = 'Standard'
scene.cycles.samples = 96
scene.cycles.use_denoising = True
scene.cycles.denoiser = 'OPENIMAGEDENOISE'
scene.cycles.max_bounces = 6

world = bpy.data.worlds.new('sky')
scene.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs[0].default_value = (0.02, 0.015, 0.012, 1)  # near-dark cave
bg.inputs[1].default_value = 0.8

# ------------------------------------------------------------------ ground
bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = 'CaveFloor'

# subdivide for displacement detail
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.subdivide(number_cuts=180)
bpy.ops.object.mode_set(mode='OBJECT')

# displacement from fractal noise -> rolling sand
disp = ground.modifiers.new('sand_disp', 'DISPLACE')
tex = bpy.data.textures.new('sand_noise', 'CLOUDS')
tex.noise_scale = 2.2
tex.noise_depth = 6
disp.texture = tex
disp.strength = 0.22
disp.mid_level = 0.0

# second, finer displacement for grain
disp2 = ground.modifiers.new('grain_disp', 'DISPLACE')
tex2 = bpy.data.textures.new('grain_noise', 'CLOUDS')
tex2.noise_scale = 9.0
tex2.noise_depth = 4
disp2.texture = tex2
disp2.strength = 0.035
disp2.mid_level = 0.0

# ------------------------------------------------------------------ material
mat = bpy.data.materials.new('cave_sand')
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
bsdf = next(n for n in nodes if n.type == 'BSDF_PRINCIPLED')


def set_socket(socket_name, value):
    """Socket names shift between Blender versions; only touch what exists."""
    if socket_name in bsdf.inputs:
        bsdf.inputs[socket_name].default_value = value


set_socket('Base Color', (0.32, 0.24, 0.16, 1))
set_socket('Roughness', 0.94)
set_socket('Subsurface Weight', 0.15)
set_socket('Subsurface Color', (0.45, 0.32, 0.2, 1))
ground.data.materials.append(mat)

# ------------------------------------------------------------------ camera
cam_data = bpy.data.cameras.new('ortho')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 9.6
cam = bpy.data.objects.new('OrthoCam', cam_data)
cam.location = (0, 0, 10)
cam.rotation_euler = (0, 0, 0)
scene.collection.objects.link(cam)
scene.camera = cam

# ------------------------------------------------------------------ light
sun_data = bpy.data.lights.new('CaveSun', 'SUN')
sun_data.energy = 5.5
sun_data.angle = 0.25  # soft but raking shadows
sun = bpy.data.objects.new('CaveSun', sun_data)
sun.location = (6, -3, 4)
sun.rotation_euler = (math.radians(62), math.radians(12), math.radians(40))
scene.collection.objects.link(sun)

# small warm fill so shadow sides never go pure black
fill_data = bpy.data.lights.new('Fill', 'POINT')
fill_data.energy = 55
fill = bpy.data.objects.new('Fill', fill_data)
fill.location = (-4, 4, 2.5)
scene.collection.objects.link(fill)

# ------------------------------------------------------------------ render
scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print(f'RENDERED {OUT}')
