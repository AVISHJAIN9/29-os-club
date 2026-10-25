# Security Audit: Camera Stream & Upload Safety

## Security Controls
1. **Camera Stream Privacy**: Video frames are processed in-memory by client-side WebAssembly; raw camera feeds are never transmitted over the internet or saved to disk.
2. **File Upload Hardening**: Multer storage rejects files exceeding 50MB and validates `%PDF-` file magic bytes to prevent polyglot executable uploads.
3. **CORS Restrictions**: Express server limits file access to verified origin domains.
