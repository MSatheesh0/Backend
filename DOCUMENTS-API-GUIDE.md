# Documents API - File Upload & Link Support

## POST /me/documents

### Two Ways to Add Documents:

---

## 1. Add Link (URL-based document)

**Use Case:** YouTube videos, Google Drive links, external URLs

**Request:**
```http
POST /me/documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Product Demo Video",
  "type": "link",
  "url": "https://youtube.com/watch?v=abc123",
  "description": "5-minute product walkthrough"
}
```

**Required Fields:**
- `title` (string) - Document title
- `type` (string) - Must be "link"
- `url` (string) - The actual URL

**Optional Fields:**
- `description` (string)

---

## 2. Add File Upload Reference

**Use Case:** PDFs, presentations, images that were uploaded to storage

**Option A - With URL (recommended):**
After uploading file to S3/Firebase/cloud storage:

```http
POST /me/documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Pitch Deck Q4 2024",
  "type": "pdf",
  "url": "https://storage.example.com/files/pitch-deck.pdf",
  "fileSize": 2457600,
  "mimeType": "application/pdf",
  "description": "Latest investor pitch deck"
}
```

**Option B - Without URL (placeholder):**
If you haven't uploaded the file yet or don't have URL:

```http
POST /me/documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Pitch Deck Q4 2024",
  "type": "pdf",
  "url": "",
  "fileSize": 2457600,
  "mimeType": "application/pdf",
  "description": "Latest investor pitch deck"
}
```

Backend will generate a placeholder URL like:
```
pending-upload://user_id/timestamp-pitch-deck-q4-2024
```

**Required Fields:**
- `title` (string) - Document title
- `type` (string) - Document type: pdf, doc, docx, ppt, pptx, image, other

**Optional Fields:**
- `url` (string) - File URL (empty string is OK)
- `fileSize` (number) - Size in bytes
- `mimeType` (string) - MIME type
- `description` (string)

---

## Valid Document Types

```typescript
"pdf"      // PDF documents
"doc"      // Word documents (.doc)
"docx"     // Word documents (.docx)
"ppt"      // PowerPoint (.ppt)
"pptx"     // PowerPoint (.pptx)
"image"    // Images (jpg, png, etc)
"link"     // External URLs
"other"    // Other file types
```

---

## Response

```json
{
  "id": "674312a5b4c9e123456789ab",
  "title": "Pitch Deck Q4 2024",
  "type": "pdf",
  "url": "https://storage.example.com/files/pitch-deck.pdf",
  "fileSize": 2457600,
  "mimeType": "application/pdf",
  "description": "Latest investor pitch deck",
  "uploadedAt": "2024-11-24T10:30:00.000Z",
  "createdAt": "2024-11-24T10:30:00.000Z"
}
```

---

## Error Responses

### Missing Required Fields
```json
{
  "error": "Missing required fields",
  "message": "title and type are required"
}
```

### Link Without URL
```json
{
  "error": "Missing required field",
  "message": "url is required for link type documents"
}
```

### Invalid Type
```json
{
  "error": "Invalid document type",
  "message": "Type must be one of: pdf, doc, docx, ppt, pptx, image, link, other"
}
```

---

## Mobile Implementation Flow

### For Link Documents:

```dart
// Simple - just send the URL
await documentsService.addDocument(
  title: "Product Demo",
  type: "link",
  url: "https://youtube.com/watch?v=abc",
  description: "Demo video"
);
```

### For File Uploads:

**Step 1:** Upload file to cloud storage (Firebase, S3, etc)
```dart
final storageUrl = await uploadToFirebase(file);
```

**Step 2:** Save document reference with URL
```dart
await documentsService.addDocument(
  title: "Pitch Deck",
  type: "pdf",
  url: storageUrl,
  fileSize: file.lengthSync(),
  mimeType: "application/pdf"
);
```

**Or use placeholder if no storage yet:**
```dart
await documentsService.addDocument(
  title: "Pitch Deck",
  type: "pdf",
  url: "", // Empty string is OK
  fileSize: file.lengthSync(),
  mimeType: "application/pdf"
);
```

---

## UPDATE: Later Add File URL

If you created a document with placeholder URL, update it later:

```http
PUT /me/documents/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://storage.example.com/files/actual-file.pdf"
}
```

*(Note: PUT endpoint needs to be implemented for updates)*

---

## Complete Flutter Example

```dart
Future<void> uploadDocument(File file, String title) async {
  try {
    // 1. Upload file to Firebase Storage (or your storage)
    final storageRef = FirebaseStorage.instance
        .ref()
        .child('documents/${DateTime.now().millisecondsSinceEpoch}_${file.path.split('/').last}');
    
    final uploadTask = await storageRef.putFile(file);
    final downloadUrl = await uploadTask.ref.getDownloadURL();
    
    // 2. Save document reference to backend
    final response = await http.post(
      Uri.parse('$baseUrl/me/documents'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'title': title,
        'type': getFileType(file.path), // 'pdf', 'image', etc
        'url': downloadUrl,
        'fileSize': await file.length(),
        'mimeType': lookupMimeType(file.path),
        'description': 'Uploaded on ${DateTime.now()}',
      }),
    );
    
    if (response.statusCode == 201) {
      print('Document uploaded successfully!');
    }
  } catch (e) {
    print('Upload error: $e');
  }
}

String getFileType(String path) {
  final ext = path.split('.').last.toLowerCase();
  if (ext == 'pdf') return 'pdf';
  if (ext == 'doc') return 'doc';
  if (ext == 'docx') return 'docx';
  if (['jpg', 'jpeg', 'png', 'gif'].contains(ext)) return 'image';
  return 'other';
}
```

---

## Summary

✅ **For Links:** `url` is REQUIRED
✅ **For Files:** `url` is OPTIONAL (can be empty string)
✅ Backend automatically generates placeholder URL if empty
✅ Update URL later after file upload completes
✅ Title and type always required

---

**Questions?** The backend now properly handles both scenarios!
