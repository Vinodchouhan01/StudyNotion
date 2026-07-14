import { apiConnector } from "../services/apiconnector"
import { uploadEndpoints } from "../services/apis"

const { UPLOAD_SIGNED_URL_API } = uploadEndpoints


async function getPreSignedUrl(token, Key, ContentType) {
  try {
    const response = await apiConnector(
      "PUT",
      UPLOAD_SIGNED_URL_API,
      { Key, ContentType },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    )
    // console.log("UPLOAD_SIGNED_URL_API RESPONSE............", response)
    return response.data
  } catch (error) {
    console.log("UPLOAD_SIGNED_URL_API ERROR............", error)
    return null
  }
}


export async function uploadFileToBucket(token, file_type, name, file) {
  console.log("uploadFileToBucket", { file_type, name })

  const presigned = await getPreSignedUrl(token, name, file_type)

  if (!presigned || !presigned.success || !presigned.uploadUrl) {
    // console.log("Error generating presigned URL", presigned)
    return
  }

  const { uploadUrl, fileUrl } = presigned

  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file_type,
      },
    })

    // console.log("S3 upload response", response.status, response.ok)
    if (response.ok) {
      // Prefer the URL the server computed; fall back to a local build if absent.
      return fileUrl
    }
    throw new Error(`S3 responded with status ${response.status}`)
  } catch (error) {
    console.error("There was a problem uploading to S3:", error)
  }
}
