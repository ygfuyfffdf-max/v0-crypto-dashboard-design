resource "vercel_project" "chronos" {
  name      = var.project_name
  framework = "nextjs"
  
  git_repository {
    type = "github"
    repo = "xpovo/chronos-infinity-2026"
  }
}

resource "vercel_deployment" "chronos_deploy" {
  project_id  = vercel_project.chronos.id
  production  = true
}
