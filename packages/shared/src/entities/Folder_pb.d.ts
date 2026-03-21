/* eslint-disable */
import * as $protobuf from 'protobufjs';
import Long = require('long');
/** Namespace echopages. */
export namespace echopages {
  /** Properties of a Folder. */
  interface IFolder {
    /** Folder id */
    id?: string | null;

    /** Folder userId */
    userId?: string | null;

    /** Folder name */
    name?: string | null;

    /** Folder parentId */
    parentId?: string | null;

    /** Folder createdAt */
    createdAt?: string | null;

    /** Folder updatedAt */
    updatedAt?: string | null;

    /** Folder isEncrypted */
    isEncrypted?: boolean | null;

    /** Folder isFavorite */
    isFavorite?: boolean | null;

    /** Folder isPinned */
    isPinned?: boolean | null;

    /** Folder tags */
    tags?: string[] | null;
  }

  /** Represents a Folder. */
  class Folder implements IFolder {
    /**
     * Constructs a new Folder.
     * @param [properties] Properties to set
     */
    constructor(properties?: echopages.IFolder);

    /** Folder id. */
    public id: string;

    /** Folder userId. */
    public userId: string;

    /** Folder name. */
    public name: string;

    /** Folder parentId. */
    public parentId: string;

    /** Folder createdAt. */
    public createdAt: string;

    /** Folder updatedAt. */
    public updatedAt: string;

    /** Folder isEncrypted. */
    public isEncrypted: boolean;

    /** Folder isFavorite. */
    public isFavorite: boolean;

    /** Folder isPinned. */
    public isPinned: boolean;

    /** Folder tags. */
    public tags: string[];

    /**
     * Creates a new Folder instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Folder instance
     */
    public static create(properties?: echopages.IFolder): echopages.Folder;

    /**
     * Encodes the specified Folder message. Does not implicitly {@link echopages.Folder.verify|verify} messages.
     * @param message Folder message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: echopages.IFolder, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Folder message, length delimited. Does not implicitly {@link echopages.Folder.verify|verify} messages.
     * @param message Folder message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: echopages.IFolder,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a Folder message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Folder
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): echopages.Folder;

    /**
     * Decodes a Folder message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Folder
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): echopages.Folder;

    /**
     * Verifies a Folder message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Folder message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Folder
     */
    public static fromObject(object: { [k: string]: any }): echopages.Folder;

    /**
     * Creates a plain object from a Folder message. Also converts values to other types if specified.
     * @param message Folder
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: echopages.Folder,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this Folder to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Folder
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }
}
