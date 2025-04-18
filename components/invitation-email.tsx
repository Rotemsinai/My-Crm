import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function InvitationEmail({ email, token }: { email: string; token: string }) {
  const setPasswordUrl = `${window.location.origin}/set-password?token=${token}`

  return (
    <Card className="max-w-md mx-auto border-2 border-dashed">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-xl">CRM Admin Invitation</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <p>Hello,</p>
        <p>
          You have been invited to join the CRM system as an administrator. Please click the button below to set up your
          password and access your account.
        </p>
        <p>
          Your email: <strong>{email}</strong>
        </p>
        <div className="py-4">
          <Button className="w-full" asChild>
            <a href={setPasswordUrl} target="_blank" rel="noopener noreferrer">
              Set Your Password
            </a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          If you didn't request this invitation, please ignore this email.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 text-xs text-muted-foreground">
        <p>This is a system-generated email. Please do not reply to this message.</p>
      </CardFooter>
    </Card>
  )
}
