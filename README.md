# Open Source REST API Framework  

**Created by Delfa frost**  

Welcome to the Open Source REST API Framework—a lightweight and customizable solution designed to streamline API development. This framework allows developers to define endpoints effortlessly and ensures seamless integration within any application.  

---

## Table of Contents  

- [Introduction](#introduction)  
- [Features](#features)  
- [Adding an API Endpoint](#adding-an-api-endpoint)  
- [Example Endpoint](#example-endpoint)  
- [Automatic Endpoint Linking](#automatic-endpoint-linking)  
- [License](#license)  

---

## Introduction  

This framework provides a simple yet powerful structure for building RESTful APIs. It enables rapid endpoint creation and automatic registration, making it perfect for both small projects and large-scale applications.  

---

## Features  

- **Modular Design**: Easily add or remove endpoints as separate modules.  
- **Automatic Endpoint Registration**: New endpoints are automatically recognized and registered.  
- **Lightweight**: Minimal dependencies for quick setup and performance.  
- **Customizable**: Tailor the framework to fit your specific project needs.  

---

## Adding an API Endpoint  

To add a new API endpoint, create a JavaScript file in the `api` directory with the following structure:  

```javascript  
exports.config = {  
    name: 'gpt', 
    author: 'Delfa frost', 
    description: 'Génère des réponses via OpenAI gpt-4o-mini', 
    category: 'ai', 
    link: ['/api/gpt?q=Bonjour'] 
};  

exports.initialize = async function ({ req, res, log }) {  
    // Votre logique ici  
};  

