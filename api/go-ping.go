package handler

import (
    "encoding/json"
    "net/http"
    "os"
    "time"
)

type pingResponse struct {
    Ok      bool   `json:"ok"`
    Message string `json:"message"`
    Runtime string `json:"runtime"`
    Time    string `json:"time"`
    Region  string `json:"region,omitempty"`
}

// Handler is the entrypoint for Vercel Go Serverless Functions.
// It responds with a simple JSON payload to verify Go runtime works.
func Handler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json; charset=utf-8")

    resp := pingResponse{
        Ok:      true,
        Message: "pong",
        Runtime: "go",
        Time:    time.Now().UTC().Format(time.RFC3339),
        Region:  os.Getenv("VERCEL_REGION"),
    }

    _ = json.NewEncoder(w).Encode(resp)
}

