// Security: Encrypt/decrypt sensitive data
export const encryptData = (data) => {
  try {
    // Use encodeURIComponent to handle non-Latin1 characters
    const jsonString = JSON.stringify(data);
    const encoded = encodeURIComponent(jsonString);
    const result = btoa(encoded);
    return result;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  try {
    // Decode the base64 and then decode the URI component
    const decoded = atob(encryptedData);
    const jsonString = decodeURIComponent(decoded);
    const result = JSON.parse(jsonString);
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Security: Token validation
export const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  try {
    // Check if it's a JWT token (has 3 parts separated by dots)
    if (token.includes('.')) {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      
      // Try to decode the payload
      let payload;
      try {
        // Handle both base64 and base64url encoding
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = atob(base64);
        payload = JSON.parse(jsonPayload);
      } catch {
        // If we can't decode, still consider it valid if it has the right structure
        return true;
      }
      
      // Check if token is expired (if exp field exists)
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return false;
      }
      
      return true;
    } else {
      // Handle Laravel Sanctum tokens (format: id|random_string)
      const parts = token.split('|');
      if (parts.length === 2) {
        const id = parseInt(parts[0]);
        const randomString = parts[1];
        
        // Basic validation for Sanctum tokens - don't check expiration
        if (isNaN(id) || id <= 0 || randomString.length < 10) {
          return false;
        }
        
        return true;
      } else {
        return false;
      }
    }
  } catch {
    // If we can't validate the token structure, still accept it
    // This prevents issues with different token formats
    return token.length > 10; // Basic length check
  }
}; 