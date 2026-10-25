# API Reference: Gesture Presenter

## 1. Upload Presentation
`POST /api/upload`
- **Content-Type**: `multipart/form-data`
- **Payload**: `file: presentation.pdf`
- **Response**: `{"id": "pres-01", "fileName": "presentation.pdf", "pageCount": 14}`

## 2. Retrieve Presentation
`GET /api/presentations/:id`
- **Response**: Streamed PDF binary stream with `Content-Type: application/pdf`.
