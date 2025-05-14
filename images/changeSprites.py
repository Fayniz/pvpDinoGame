from PIL import Image, ImageOps
import os

def invert_sprite_colors(input_path, output_path):
    # Open the image
    image = Image.open(input_path).convert("RGBA")

    # Separate the alpha channel
    r, g, b, a = image.split()

    # Merge RGB and invert it
    rgb_image = Image.merge("RGB", (r, g, b))
    inverted_rgb = ImageOps.invert(rgb_image)

    # Re-attach alpha and save
    inverted_image = Image.merge("RGBA", (*inverted_rgb.split(), a))
    inverted_image.save(output_path)
    print(f"Inverted sprite saved to: {output_path}")

# Example usage
input_sprite = "images/dino_run2.png"         # Replace with your sprite path
output_sprite = "images/inverted_dino_run2.png"
invert_sprite_colors(input_sprite, output_sprite)
