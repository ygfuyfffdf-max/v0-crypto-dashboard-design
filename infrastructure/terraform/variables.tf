variable "vercel_api_token" {
  description = "Vercel API Token"
  type        = string
  sensitive   = true
}

variable "location" {
  description = "Azure Region"
  default     = "East US"
}

variable "project_name" {
  description = "Project Name"
  default     = "chronos-infinity-2026"
}
