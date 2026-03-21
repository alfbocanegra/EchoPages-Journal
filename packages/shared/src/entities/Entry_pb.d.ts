/* eslint-disable */
import * as $protobuf from 'protobufjs';
import Long = require('long');
/** Namespace echopages. */
export namespace echopages {
  /** Properties of an Entry. */
  interface IEntry {
    /** Entry id */
    id?: string | null;

    /** Entry userId */
    userId?: string | null;

    /** Entry folderId */
    folderId?: string | null;

    /** Entry title */
    title?: string | null;

    /** Entry content */
    content?: string | null;

    /** Entry contentType */
    contentType?: string | null;

    /** Entry isEncrypted */
    isEncrypted?: boolean | null;

    /** Entry mood */
    mood?: string | null;

    /** Entry weather */
    weather?: string | null;

    /** Entry location */
    location?: string | null;

    /** Entry isFavorite */
    isFavorite?: boolean | null;

    /** Entry isPinned */
    isPinned?: boolean | null;

    /** Entry localId */
    localId?: string | null;

    /** Entry syncStatus */
    syncStatus?: string | null;

    /** Entry lastSyncAt */
    lastSyncAt?: string | null;

    /** Entry createdAt */
    createdAt?: string | null;

    /** Entry updatedAt */
    updatedAt?: string | null;

    /** Entry tags */
    tags?: string[] | null;

    /** Entry media */
    media?: string[] | null;

    /** Entry versions */
    versions?: string[] | null;
  }

  /** Represents an Entry. */
  class Entry implements IEntry {
    /**
     * Constructs a new Entry.
     * @param [properties] Properties to set
     */
    constructor(properties?: echopages.IEntry);

    /** Entry id. */
    public id: string;

    /** Entry userId. */
    public userId: string;

    /** Entry folderId. */
    public folderId: string;

    /** Entry title. */
    public title: string;

    /** Entry content. */
    public content: string;

    /** Entry contentType. */
    public contentType: string;

    /** Entry isEncrypted. */
    public isEncrypted: boolean;

    /** Entry mood. */
    public mood: string;

    /** Entry weather. */
    public weather: string;

    /** Entry location. */
    public location: string;

    /** Entry isFavorite. */
    public isFavorite: boolean;

    /** Entry isPinned. */
    public isPinned: boolean;

    /** Entry localId. */
    public localId: string;

    /** Entry syncStatus. */
    public syncStatus: string;

    /** Entry lastSyncAt. */
    public lastSyncAt: string;

    /** Entry createdAt. */
    public createdAt: string;

    /** Entry updatedAt. */
    public updatedAt: string;

    /** Entry tags. */
    public tags: string[];

    /** Entry media. */
    public media: string[];

    /** Entry versions. */
    public versions: string[];

    /**
     * Creates a new Entry instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Entry instance
     */
    public static create(properties?: echopages.IEntry): echopages.Entry;

    /**
     * Encodes the specified Entry message. Does not implicitly {@link echopages.Entry.verify|verify} messages.
     * @param message Entry message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: echopages.IEntry, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Entry message, length delimited. Does not implicitly {@link echopages.Entry.verify|verify} messages.
     * @param message Entry message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: echopages.IEntry,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes an Entry message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Entry
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): echopages.Entry;

    /**
     * Decodes an Entry message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Entry
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): echopages.Entry;

    /**
     * Verifies an Entry message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an Entry message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Entry
     */
    public static fromObject(object: { [k: string]: any }): echopages.Entry;

    /**
     * Creates a plain object from an Entry message. Also converts values to other types if specified.
     * @param message Entry
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: echopages.Entry,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this Entry to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Entry
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }
}
