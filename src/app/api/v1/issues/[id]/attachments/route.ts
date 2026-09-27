import { NextRequest } from "next/server"
import { getTenantContext } from "@/lib/tenant"
import { issueService } from "@/services/issue.service"
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api-response"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await getTenantContext()
    if (!tenant) return apiUnauthorized()

    const { id } = await params
    const body = await req.json()

    if (!body.name || !body.size || !body.type) {
      return apiError("File name, size, and MIME type are required", "VALIDATION_ERROR", 400)
    }

    const attachment = await issueService.addAttachment(id, tenant.organizationId, tenant.userId, {
      name: body.name,
      size: body.size,
      type: body.type,
    })

    return apiSuccess(attachment, 201)
  } catch (error: any) {
    if (error.code === "ISSUE_NOT_FOUND") return apiError(error.message, "ISSUE_NOT_FOUND", 404)
    return apiError(error.message || "Failed to attach file", "INTERNAL_SERVER_ERROR", 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await getTenantContext()
    if (!tenant) return apiUnauthorized()

    const { searchParams } = new URL(req.url)
    const attachmentId = searchParams.get("attachmentId")

    if (!attachmentId) {
      return apiError("attachmentId query parameter is required", "VALIDATION_ERROR", 400)
    }

    const result = await issueService.deleteAttachment(attachmentId, tenant.organizationId, tenant.userId)
    return apiSuccess(result)
  } catch (error: any) {
    if (error.code === "ATTACHMENT_NOT_FOUND") return apiError(error.message, "ATTACHMENT_NOT_FOUND", 404)
    return apiError("Failed to delete attachment", "INTERNAL_SERVER_ERROR", 500)
  }
}
