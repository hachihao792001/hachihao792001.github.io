import subprocess
import os

# Output folder for patches
output_dir = "patches"
os.makedirs(output_dir, exist_ok=True)

for i in range(1, 34):
    file_a = f"htmlPreviews\\htmlPreview{i}.html"
    file_b = f"htmlPreviews\\htmlPreview{i+1}.html"
    patch_name = f"diff_{i}_{i+1}.patch"
    patch_path = os.path.join(output_dir, patch_name)

    print(f"Generating {patch_name}...")

    result = subprocess.run(
        ["git", "diff", "--no-index", file_a, file_b],
        capture_output=True,
        text=True
    )

    # Split into lines and remove first 2 lines
    lines = result.stdout.splitlines()

    if len(lines) > 2:
        cleaned = "\n".join(lines[2:]) + "\n"
    else:
        cleaned = ""  # empty or too short

    with open(patch_path, "w", encoding="utf-8") as f:
        f.write(cleaned)

print("Done! All patch files created.")