export declare global {
  interface FileSystemHandlePermissionDescriptor {
    mode: "read" | "readwrite";
  }

  interface FileSystemHandle {
    kind: "file" | "directory";
    name: string;
    isSameEntry(anotherFileSystemHandle: FileSystemHandle): boolean;
    queryPermission(fileSystemHandlePermissionDescriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionStatus["state"]>;
    requestPermission(fileSystemHandlePermissionDescriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionStatus["state"]>;
  }

  type FileSystemDirectoryIterator = AsyncIterableIterator<[string, FileSystemHandle]>;

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    entries(): Promise<FileSystemDirectoryIterator>;
    getFileHandle();
    getDirectoryHandle();
    keys();
    removeEntry();
    resolve();
    values();
  }

  interface WriteDataOptions {
    type: "write" | "seek" | "truncate";
    data: BufferSource | Blob | string;
    position?: number;
    size?: number;
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | WriteDataOptions);
    seek();
    truncate();
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    getFile(): Promise<File>;
    createWritable(): Promise<FileSystemWritableFileStream>;
  }

  type FileTypeObject = {
    description: string;
    accept: {
      [mimeType: string]: string[];
    };
  };

  interface ShowOpenFilePickerOptions {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: FileTypeObject[];
  }

	interface Window {
		showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker(options?: ShowOpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
	}
}
