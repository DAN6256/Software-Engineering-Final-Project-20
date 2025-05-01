"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Loader2, LogOut, X, User, Mail, GraduationCap, Calendar } from "lucide-react"

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = () => {
      try {
        // Get the user data directly from localStorage
        const storedUser = localStorage.getItem("userData")
        const token = localStorage.getItem("authToken")

        if (!token) {
          throw new Error("No authentication token found")
        }

        if (!storedUser) {
          throw new Error("No user data found")
        }

        // Set the user state with the stored data
        setUser(JSON.parse(storedUser))
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load user data",
        })
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router, toast])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userData")
    router.push("/login")
  }

  const handleClose = () => {
    router.back() // Go back to previous page
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-600 mx-auto" />
          <p className="mt-4 text-gray-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="mb-4 text-gray-400">
            <User className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-lg font-medium">No user data available</p>
          <p className="text-gray-500 mt-2">Please log in to view your profile</p>
          <Button className="mt-6 w-full bg-gray-800 hover:bg-gray-700" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </Card>
      </div>
    )
  }

  // Handle different property casing
  const userData = {
    name: user.Name || user.name,
    email: user.Email || user.email,
    role: user.Role || user.role,
    major: user.major,
    yearGroup: user.yearGroup,
  }

  // Get initials for avatar
  const getInitials = () => {
    if (!userData.name) return "U"
    return userData.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="relative p-0 pb-6">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-gray-100 h-32 w-full flex items-end justify-center">
            <Avatar className="h-24 w-24 border-4 border-white translate-y-12 shadow-lg">
              <AvatarFallback className="bg-gray-200 text-gray-800 text-xl font-bold">{getInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>

        <CardContent className="pt-16 px-6">
          {userData.name && (
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
              <Badge variant="outline" className="mt-2 font-normal capitalize text-gray-600">
                {userData.role?.toLowerCase() || "user"}
              </Badge>
            </div>
          )}

          <Separator className="my-6" />

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 p-2 rounded-full">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{userData.email}</p>
              </div>
            </div>

            {userData.major && (
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <GraduationCap className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Major</p>
                  <p className="font-medium text-gray-800">{userData.major}</p>
                </div>
              </div>
            )}

            {userData.yearGroup && (
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Year Group</p>
                  <p className="font-medium text-gray-800">{userData.yearGroup}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-6 py-6 bg-gray-50 border-t border-gray-100">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <LogOut className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
