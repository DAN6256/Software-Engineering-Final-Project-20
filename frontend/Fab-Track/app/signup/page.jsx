"use client"
// Import UI components
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
// API base URL from environment variables
const BASE_URL_API = process.env.NEXT_PUBLIC_BASE_URL_API

export default function SignupPage() {
  // State management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    major: "",
    yearGroup: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  // Hooks
  const router = useRouter()
  const { toast } = useToast()
  // Handles form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
// Handles form submission for user registration
  const handleSubmit = async (e) => {
    e.preventDefault()
 // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Send registration data to API
      const response = await fetch(`${BASE_URL_API}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "Student", // Default role for all signups
          major: formData.major,
          yearGroup: formData.yearGroup,
        }),
      })

      // Log response details for debugging
    const responseData = await response.json();
    console.log('Response Data:', responseData);

      if (!response.ok) {
        throw new Error("Registration failed")
      }
      // Show success notification
      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please log in.",
      })
      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      {/* Signup card container */}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to sign up</CardDescription>
        </CardHeader>
         {/* Signup form */}
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Name input */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
             {/* Email input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@ashesi.edu.gh"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {/* Major input */}
            <div className="space-y-2">
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                name="major"
                placeholder="Computer Engineering"
                value={formData.major}
                onChange={handleChange}
                required
              />
            </div>
            {/* Year group input */}
            <div className="space-y-2">
              <Label htmlFor="yearGroup">Year Group</Label>
              <Input
                id="yearGroup"
                name="yearGroup"
                placeholder="2025"
                value={formData.yearGroup}
                onChange={handleChange}
                required
              />
            </div>
            {/* Password input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {/* Confirm password input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          {/* Form footer with submit button and login link */}
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account
                </>
              ) : (
                "Create account"
              )}
            </Button>
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
