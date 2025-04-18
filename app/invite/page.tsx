"use client"

import { useState } from "react"
import { InvitationEmail } from "@/components/invitation-email"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function InvitePage() {
  const [emailSent, setEmailSent] = useState(false)
  const email = "rotemsinaii@gmail.com"
  const token = `invite_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

  const handleSendInvitation = () => {
    // In a real app, this would call an API to send the email
    setEmailSent(true)
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Invitation</CardTitle>
          <CardDescription>Send an invitation to the admin user to set up their account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You are about to send an invitation to: <strong>{email}</strong>
          </p>
          {!emailSent ? (
            <Button onClick={handleSendInvitation}>Send Invitation</Button>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">Invitation sent successfully!</p>
              <p>Below is a preview of the email that would be sent in a production environment:</p>
              <div className="mt-6">
                <InvitationEmail email={email} token={token} />
              </div>
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  For this demo, you can click the button in the email preview above to continue to the password setup
                  page.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
