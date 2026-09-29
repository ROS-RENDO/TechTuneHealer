import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

src_path = r"C:\Users\ROS RENDO\.gemini\antigravity-ide\brain\f7573084-c44a-44e9-8811-07089a336daf\.user_uploaded\media_1790700142847.png"
out_dir_mobile = r"D:\CamtechUniversity\ProgrammingYearIII\techtune-healer\assets"
out_dir_web = r"D:\CamtechUniversity\ProgrammingYearIII\techtune-healer\admin-web\public"

os.makedirs(out_dir_mobile, exist_ok=True)
os.makedirs(out_dir_web, exist_ok=True)

# 1. Load original
orig = Image.open(src_path).convert("RGB")
arr = np.array(orig)
brightness = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]

# 2. Extract clean alpha channel
# Pixels < 110: fully solid emblem
# Pixels 110-195: smooth antialiased edge
# Pixels >= 195: fully transparent
alpha = np.zeros_like(brightness)
alpha[brightness < 110] = 255
ramp = (brightness >= 110) & (brightness < 195)
alpha[ramp] = 255 * (1.0 - (brightness[ramp] - 110.0) / (195.0 - 110.0))
alpha[alpha < 10] = 0

# Keep RGB crisp dark charcoal
rgb = arr.copy()
# Normalize dark pixels so they are deep rich charcoal (#1E293B / #0F172A)
dark_mask = alpha > 50
for c in range(3):
    channel = rgb[:, :, c].astype(float)
    channel[dark_mask] = np.clip(channel[dark_mask] * 0.75, 15, 60)
    rgb[:, :, c] = channel.astype(np.uint8)

transparent_arr = np.dstack((rgb, alpha.astype(np.uint8)))
trans_full = Image.fromarray(transparent_arr, "RGBA")

# Crop to tight bounding box with comfortable padding
bbox = trans_full.getbbox()
pad = 16
crop_box = (
    max(0, bbox[0] - pad),
    max(0, bbox[1] - pad),
    min(trans_full.width, bbox[2] + pad),
    min(trans_full.height, bbox[3] + pad)
)
emblem_dark = trans_full.crop(crop_box)

# Save dark transparent emblem
emblem_dark.save(os.path.join(out_dir_mobile, "logo.png"))
emblem_dark.save(os.path.join(out_dir_mobile, "logo-transparent.png"))
emblem_dark.save(os.path.join(out_dir_web, "logo.png"))
emblem_dark.save(os.path.join(out_dir_web, "logo-transparent.png"))

# 3. Create crisp white/silver version for dark backgrounds
arr_dark = np.array(emblem_dark)
arr_white = np.zeros_like(arr_dark)
# Pure white/light silver (#FFFFFF)
arr_white[:, :, 0] = 255
arr_white[:, :, 1] = 255
arr_white[:, :, 2] = 255
# Keep alpha
arr_white[:, :, 3] = arr_dark[:, :, 3]
emblem_white = Image.fromarray(arr_white, "RGBA")
emblem_white.save(os.path.join(out_dir_mobile, "logo-white.png"))
emblem_white.save(os.path.join(out_dir_web, "logo-white.png"))

# 4. Create App Icon (1024x1024)
# Premium automotive deep slate/navy background (#0A0F1D to #0F172A)
icon_size = 1024
icon = Image.new("RGBA", (icon_size, icon_size), (11, 15, 26, 255)) # Dark navy/slate
draw = ImageDraw.Draw(icon)

# Draw subtle radial gradient glow in center
center_x, center_y = icon_size // 2, icon_size // 2
for r in range(400, 0, -5):
    alpha_glow = int(18 * (1 - r / 400))
    glow_color = (30, 58, 138, alpha_glow) # deep cobalt blue glow
    draw.ellipse(
        [center_x - r, center_y - r, center_x + r, center_y + r],
        fill=glow_color
    )

# Resize emblem to fit nicely with Android circular safe area (width ~ 720px)
target_w = 720
aspect = emblem_white.height / emblem_white.width
target_h = int(target_w * aspect)
resized_emblem = emblem_white.resize((target_w, target_h), Image.Resampling.LANCZOS)
paste_x = (icon_size - target_w) // 2
paste_y = (icon_size - target_h) // 2
icon.paste(resized_emblem, (paste_x, paste_y), resized_emblem)

icon.save(os.path.join(out_dir_mobile, "icon.png"))
icon.save(os.path.join(out_dir_mobile, "adaptive-icon.png"))

# 5. Create Splash Screen (1284 x 2778)
splash_w, splash_h = 1284, 2778
splash = Image.new("RGBA", (splash_w, splash_h), (11, 15, 26, 255))
splash_draw = ImageDraw.Draw(splash)

# Subtle center ambient glow
for r in range(500, 0, -8):
    alpha_glow = int(22 * (1 - r / 500))
    glow_color = (30, 58, 138, alpha_glow)
    splash_draw.ellipse(
        [splash_w // 2 - r, splash_h // 2 - 100 - r, splash_w // 2 + r, splash_h // 2 - 100 + r],
        fill=glow_color
    )

splash_target_w = 840
splash_target_h = int(splash_target_w * aspect)
splash_emblem = emblem_white.resize((splash_target_w, splash_target_h), Image.Resampling.LANCZOS)
splash_x = (splash_w - splash_target_w) // 2
splash_y = (splash_h - splash_target_h) // 2 - 120
splash.paste(splash_emblem, (splash_x, splash_y), splash_emblem)

splash.save(os.path.join(out_dir_mobile, "splash.png"))

# 6. Create Web Favicons
fav_size = 192
fav = Image.new("RGBA", (fav_size, fav_size), (11, 15, 26, 255))
fav_target_w = 150
fav_target_h = int(fav_target_w * aspect)
fav_emblem = emblem_white.resize((fav_target_w, fav_target_h), Image.Resampling.LANCZOS)
fav.paste(fav_emblem, ((fav_size - fav_target_w) // 2, (fav_size - fav_target_h) // 2), fav_emblem)
fav.save(os.path.join(out_dir_mobile, "favicon.png"))
fav.save(os.path.join(out_dir_web, "favicon.png"))
fav.resize((48, 48), Image.Resampling.LANCZOS).save(os.path.join(out_dir_web, "favicon.ico"))

print(f"Generated logo size: {emblem_dark.size}")
print("All assets successfully produced!")
