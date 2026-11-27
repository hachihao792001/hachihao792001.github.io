import subprocess
import os

# Output folder for patches
output_dir = "patches"
os.makedirs(output_dir, exist_ok=True)

# Dynamically determine the number of files
html_previews_dir = "htmlPreviews"
file_count = 0

# Count how many htmlPreview*.html files exist
for filename in os.listdir(html_previews_dir):
    if filename.startswith("htmlPreview") and filename.endswith(".html"):
        file_count += 1

# Generate patches between consecutive files
for i in range(1, file_count):
    file_a = f"htmlPreviews\\htmlPreview{i}.html"
    file_b = f"htmlPreviews\\htmlPreview{i+1}.html"
    patch_name = f"diff_{i}_{i+1}.patch"
    patch_path = os.path.join(output_dir, patch_name)

    print(f"Generating {patch_name}...")

    result = subprocess.run(
        ["git", "diff", "--no-index", file_a, file_b],
        capture_output=True,
        text=True,
        encoding="utf-8"
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