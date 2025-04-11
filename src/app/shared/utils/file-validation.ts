export class FileValidator {
  static validateImageFile(
    file: File,
    maxSizeBytes = 5 * 1024 * 1024,
    minWidth = 100,
    minHeight = 100,
    maxWidth = 2000,
    maxHeight = 2000
  ): Promise<boolean> {
    return new Promise((resolve) => {
      // Check file extension
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        console.error('Invalid file extension');
        resolve(false);
        return false;
      }

      const reader = new FileReader();

      reader.onloadend = (event) => {
        if (!event.target?.result) {
          resolve(false);
          return false;
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
          console.error('File type does not match extension');
          resolve(false);
          return false;
        }

        if (file.size > maxSizeBytes) {
          console.error('File size exceeds the limit');
          resolve(false);
          return false;
        }

        const img = new Image();
        img.onload = () => {
          if (
            img.width < minWidth ||
            img.height < minHeight ||
            img.width > maxWidth ||
            img.height > maxHeight
          ) {
            console.error(
              `Invalid image dimensions: ${img.width}x${img.height}`
            );
            resolve(false);
            return false;
          } else {
            console.info(
              `Valid image: ${img.width}x${img.height}, ${file.size} bytes`
            );
            resolve(true);
            return true;
          }
        };
        img.onerror = () => {
          console.error('Error loading image');
          resolve(false);
          return 'Error loading image';
        };

        img.src = URL.createObjectURL(file);
        return true;
      };

      reader.readAsArrayBuffer(file.slice(0, 4));
      return true;
    });
  }

  static validateVideoFile(
    file: File,
    maxSizeBytes = 10 * 1024 * 1024 * 1024,
    maxDurationSeconds = 10800
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const allowedExtensions = ['mp4', 'mov', 'webm', 'mpeg', 'mpg', 'm4v'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        console.error('Invalid file extension');
        resolve(false);
        return;
      }

      if (file.size > maxSizeBytes) {
        console.error('File size exceeds the limit');
        resolve(false);
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
        console.error('Invalid file type');
        resolve(false);
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
          console.error('Invalid video file signature');
          resolve(false);
          return;
        }

        // Continue with duration and dimension checks
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);

          if (video.duration > maxDurationSeconds) {
            console.error(`Video duration ${video.duration}s exceeds limit`);
            resolve(false);
            return;
          }

          if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error('Invalid video dimensions');
            resolve(false);
            return;
          }

          console.info(
            `Valid video: ${video.videoWidth}x${video.videoHeight}, ${file.size} bytes, ${video.duration}s`
          );
          resolve(true);
        };

        video.onerror = () => {
          console.error('Error loading video');
          URL.revokeObjectURL(video.src);
          resolve(false);
        };

        video.src = URL.createObjectURL(file);
      };

      reader.onerror = () => {
        console.error('Error reading file');
        resolve(false);
      };

      reader.readAsArrayBuffer(file.slice(0, 16));
    });
  }
}
