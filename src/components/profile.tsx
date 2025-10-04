import { useAuth } from "@/lib/auth";
import {  useLazyGetUsersByIdQuery } from "@/store/userApi";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { User, Mail, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import type { Userinfo } from "@/lib/types";

export function Profile() {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<Userinfo | null>(null);

  const [getUserDetails, { isError: error, isLoading, data }] = useLazyGetUsersByIdQuery();

  useEffect(() => {
    if (user?.id) {
      getUserDetails(user.id);
    }
  }, [user?.id, getUserDetails]);

  useEffect(() => {
    if (data) {
      setUserDetails(data);
    }
  }, [data]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg font-semibold text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg font-semibold text-destructive">Error loading profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold text-foreground flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-semibold text-foreground">{userDetails.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold text-foreground">
                    {userDetails.first_name} {userDetails.last_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{userDetails.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-semibold text-foreground capitalize">{userDetails.role}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center pt-6">
              <Button variant="outline" size="lg">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
