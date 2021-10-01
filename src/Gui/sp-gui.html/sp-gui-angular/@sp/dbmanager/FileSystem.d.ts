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

	interface Window {
		showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker(): Promise<FileSystemFileHandle>;
	}
}
