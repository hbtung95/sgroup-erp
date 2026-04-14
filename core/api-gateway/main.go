package main

import (
	"log"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Reverse Proxy targets
	targets := map[string]string{
		"/api/hr":      "http://localhost:8081",
		"/api/project": "http://localhost:8082",
		"/api/sales":   "http://localhost:8083",
		"/api/crm":     "http://localhost:8084",
	}

	for prefix, target := range targets {
		targetURL, _ := url.Parse(target)
		proxy := httputil.NewSingleHostReverseProxy(targetURL)

		// Create a local variable for the loop
		p := prefix
		
		r.Any(p+"/*path", func(c *gin.Context) {
			proxy.ServeHTTP(c.Writer, c.Request)
		})
	}

	log.Println("API Gateway listening on :8080")
	r.Run(":8080")
}

