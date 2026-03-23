// Cloudinary upload utility
// Usage: await uploadToCloudinary(file)
// Returns: { url, public_id } or throws error

export async function uploadToCloudinary(file) {
  const url = "https://api.cloudinary.com/v1_1/dsho4uf2t/image/upload";
  const formData = new FormData();
  formData.append("file", file);
  // Use unsigned upload preset for security (set up in Cloudinary dashboard)
  formData.append("upload_preset", "unsigned_preset");

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Cloudinary upload failed");
  }
  return await response.json();
}
