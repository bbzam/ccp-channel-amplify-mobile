export class FileValidator {
  static validateImageFile(
    file: File,
    maxSizeBytes = 5 * 1024 * 1024,
    minWidth = 100,
    minHeight = 100,
    maxWidth = 2000,
    maxHeight = 2000
  ): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      // Check file extension
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        const error = `Invalid file extension: ${
          fileExtension || 'unknown'
        }. Allowed extensions are: ${allowedExtensions.join(', ')}`;
        console.error(error);
        resolve({ valid: false, error });
        return;
      }

      const reader = new FileReader();

      reader.onloadend = (event) => {
        if (!event.target?.result) {
          const error = 'Failed to read file content';
          console.error(error);
          resolve({ valid: false, error });
          return;
        }

        const uintArray = new Uint8Array(event.target.result as ArrayBuffer);
        const magicNumbers = uintArray.subarray(0, 4);
        const hex = Array.from(magicNumbers)
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');

        // Map file signatures to extensions
        const signatureMap = {
          '89504e47': ['png'],
          ffd8ffe0: ['jpg', 'jpeg'],
          ffd8ffe1: ['jpg', 'jpeg'],
          ffd8ffe2: ['jpg', 'jpeg'],
          ffd8ffe3: ['jpg', 'jpeg'],
          '47494638': ['gif'],
          '424d': ['bmp'],
          '52494646': ['webp'],
        };

        // Check if magic number matches the file extension
        let isValidType = false;
        for (const [signature, extensions] of Object.entries(signatureMap)) {
          if (hex.startsWith(signature)) {
            isValidType = extensions.includes(fileExtension);
            break;
          }
        }

        if (!isValidType) {
          const error = `File content does not match the extension: ${fileExtension}. The file may be corrupted or renamed.`;
          console.error(error);
          resolve({ valid: false, error });
          return;
        }

        if (file.size > maxSizeBytes) {
          const maxSizeMB = maxSizeBytes / (1024 * 1024);
          const error = `File size (${(file.size / (1024 * 1024)).toFixed(
            2
          )} MB) exceeds the limit of ${maxSizeMB.toFixed(2)} MB`;
          console.error(error);
          resolve({ valid: false, error });
          return;
        }

        const img = new Image();
        img.onload = () => {
          if (
            img.width < minWidth ||
            img.height < minHeight ||
            img.width > maxWidth ||
            img.height > maxHeight
          ) {
            const error = `Invalid image dimensions: ${img.width}x${img.height}. Required dimensions: width between ${minWidth} and ${maxWidth}px, height between ${minHeight} and ${maxHeight}px`;
            console.error(error);
            resolve({ valid: false, error });
            return;
          } else {
            console.info(
              `Valid image: ${img.width}x${img.height}, ${file.size} bytes`
            );
            resolve({ valid: true });
            return;
          }
        };
        img.onerror = () => {
          const error =
            'Error loading image: The file may be corrupted or not a valid image';
          console.error(error);
          resolve({ valid: false, error });
          return;
        };

        img.src = URL.createObjectURL(file);
      };

      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  }

  static validateVideoFile(
    file: File,
    maxSizeBytes = 10 * 1024 * 1024 * 1024,
    maxDurationSeconds = 10800
  ): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const allowedExtensions = ['mp4', 'mov', 'webm', 'mpeg', 'mpg', 'm4v'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        const error = `Invalid file extension: ${
          fileExtension || 'unknown'
        }. Allowed extensions are: ${allowedExtensions.join(', ')}`;
        console.error(error);
        resolve({ valid: false, error });
        return;
      }

      if (file.size > maxSizeBytes) {
        const maxSizeGB = maxSizeBytes / (1024 * 1024 * 1024);
        const error = `File size (${(file.size / (1024 * 1024 * 1024)).toFixed(
          2
        )} GB) exceeds the limit of ${maxSizeGB.toFixed(2)} GB`;
        console.error(error);
        resolve({ valid: false, error });
        return;
      }

      const allowedMimeTypes = [
        'video/mp4',
        'video/quicktime',
        'video/webm',
        'video/mpeg',
        'video/x-m4v',
      ];

      if (!allowedMimeTypes.includes(file.type)) {
        const error = `Invalid file type: ${
          file.type
        }. Allowed types are: ${allowedMimeTypes.join(', ')}`;
        console.error(error);
        resolve({ valid: false, error });
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const buffer = new Uint8Array(reader.result as ArrayBuffer).slice(
          0,
          16
        );

        // Video signatures matching the AWS Lambda implementation
        const signatures = {
          mp4: [
            [0x00, 0x00, 0x00], // Variable length box size
            [0x66, 0x74, 0x79, 0x70], // 'ftyp'
            [0x69, 0x73, 0x6f, 0x6d], // 'isom'
            [0x6d, 0x70, 0x34, 0x32], // 'mp42'
          ],
          mov: [
            [
              0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20,
              0x20,
            ],
            [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
            [0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20],
            [
              0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34,
              0x32,
            ],
            [0x6d, 0x6f, 0x6f, 0x76],
          ],
          m4v: [[0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x56, 0x20]],
          webm: [[0x1a, 0x45, 0xdf, 0xa3]],
          mpeg: [[0x47], [0x00, 0x00, 0x01, 0xba], [0x00, 0x00, 0x01, 0xb3]],
        };

        const bufferHex = Array.from(buffer)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        const extensionSignatures =
          signatures[fileExtension as keyof typeof signatures];
        let isValidSignature = false;

        if (extensionSignatures) {
          isValidSignature = extensionSignatures.some((signature) => {
            const signatureHex = Array.from(new Uint8Array(signature))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('');

            // For MP4, MOV - check if signature exists anywhere in first 16 bytes
            if (['mp4', 'mov'].includes(fileExtension)) {
              return bufferHex.includes(signatureHex);
            }

            // For MPEG - special handling
            if (fileExtension === 'mpeg') {
              return signature.length === 1
                ? buffer[0] === signature[0]
                : bufferHex.startsWith(signatureHex);
            }

            // For other formats - check start of buffer
            return bufferHex.startsWith(signatureHex);
          });
        }

        if (!isValidSignature) {
          const error = `Invalid video file signature for ${fileExtension} format. The file may be corrupted or renamed.`;
          console.error(error);
          resolve({ valid: false, error });
          return;
        }

        // Continue with duration and dimension checks
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);

          if (video.duration > maxDurationSeconds) {
            const maxDurationMinutes = Math.floor(maxDurationSeconds / 60);
            const error = `Video duration (${Math.floor(
              video.duration / 60
            )} minutes) exceeds the limit of ${maxDurationMinutes} minutes`;
            console.error(error);
            resolve({ valid: false, error });
            return;
          }

          if (video.videoWidth === 0 || video.videoHeight === 0) {
            const error =
              'Invalid video dimensions: The video has zero width or height';
            console.error(error);
            resolve({ valid: false, error });
            return;
          }

          console.info(
            `Valid video: ${video.videoWidth}x${video.videoHeight}, ${file.size} bytes, ${video.duration}s`
          );
          resolve({ valid: true });
        };

        video.onerror = () => {
          const error =
            'Error loading video: The file may be corrupted or not a valid video format';
          console.error(error);
          resolve({ valid: false, error });
        };

        video.src = URL.createObjectURL(file);
      };

      reader.onerror = () => {
        const error =
          'Error reading file: The file may be inaccessible or corrupted';
        console.error(error);
        resolve({ valid: false, error });
      };

      reader.readAsArrayBuffer(file.slice(0, 16));
    });
  }
}
