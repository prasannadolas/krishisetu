# Security Specification: KrishiSetu Agriculture Platform

## 1. Data Invariants
- **User Profile Isolation**: Only the authenticated farmer (`request.auth.uid == userId`) can read or write their own user profile document (`/users/{userId}`).
- **Farmer Records Privacy**: Subcollection `/users/{userId}/records/{recordId}` can ONLY be read, created, or deleted by the owning farmer whose UID matches `userId`. Users cannot manipulate or view another farmer's soil scans, diagnoses, or farm logs.
- **Relational Integrity**: On creation, `request.resource.data.userId == request.auth.uid`. No user can forge records under another user ID.
- **Community Reports**: Any authenticated farmer can create a field report under `/communityReports/{reportId}` if `request.resource.data.userId == request.auth.uid`. All users can read alerts to support the regional community warning mesh, but only the author can delete their report.
- **Strict Size and Field Guards**: Every string must have a verified length limit (`size() <= MAX`), preventing denial-of-wallet payload attacks.
- **Default Deny**: All unmatched collections are denied by `match /{document=**} { allow read, write: if false; }`.

## 2. Dirty Dozen Test Cases (Must all return PERMISSION_DENIED)
1. **Unauthenticated User Profile Read**: Anonymous user attempts to read `/users/farmer123`.
2. **Cross-User Profile Write**: Authenticated user `farmer456` attempts to create or overwrite `/users/farmer123`.
3. **Forged Author UID on Record**: User `farmer123` attempts to write a record with `userId: "admin"` or `userId: "farmer456"`.
4. **Cross-User Record Read**: User `farmer456` attempts to query or read `/users/farmer123/records/rec999`.
5. **Cross-User Record Delete**: User `farmer456` attempts to delete `/users/farmer123/records/rec999`.
6. **Oversized String Injection in User**: User attempts to inject a 100KB name string in `/users/{userId}`.
7. **Invalid Record Type**: User attempts to create a record with unknown `recordType: "exploit_code"`.
8. **Oversized Community Report Description**: Attacker attempts to post a 50KB description into `/communityReports/{reportId}`.
9. **Forged Community Report Author**: User `farmer123` attempts to submit `/communityReports/rep1` with `userId: "gov_official"`.
10. **Malicious Document ID Traversal**: Attacker submits document ID containing special injection characters or exceeding 128 characters.
11. **Client Arbitrary Collection Creation**: Attacker attempts to create a new top-level collection `/secrets` or `/admins`.
12. **Modifying System or Fixed Keys on Update**: User attempts to alter immutable `userId` on record update.
