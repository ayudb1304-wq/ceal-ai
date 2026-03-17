import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function getCanonicalOrigin() {
  const authUrl = process.env.AUTH_URL

  if (!authUrl) {
    return null
  }

  try {
    return new URL(authUrl)
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const canonicalOrigin = getCanonicalOrigin()

  if (!canonicalOrigin) {
    return NextResponse.next()
  }

  const requestUrl = request.nextUrl
  const requestOrigin = `${requestUrl.protocol}//${requestUrl.host}`
  const canonical = `${canonicalOrigin.protocol}//${canonicalOrigin.host}`

  if (requestOrigin === canonical) {
    return NextResponse.next()
  }

  const redirectUrl = new URL(requestUrl.pathname + requestUrl.search, canonicalOrigin)

  return NextResponse.redirect(redirectUrl, 307)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
