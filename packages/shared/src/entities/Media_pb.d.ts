import * as $protobuf from 'protobufjs';
import Long = require('long');
/** Namespace echopages. */
export namespace echopages {
  /** Properties of a Media. */
  interface IMedia {
    /** Media id */
    id?: string | null;

    /** Media userId */
    userId?: string | null;

    /** Media entryId */
    entryId?: string | null;

    /** Media url */
    url?: string | null;

    /** Media type */
    type?: string | null;

    /** Media size */
    size?: number | Long | null;

    /** Media createdAt */
    createdAt?: string | null;

    /** Media updatedAt */
    updatedAt?: string | null;

    /** Media isEncrypted */
    isEncrypted?: boolean | null;

    /** Media metadata */
    metadata?: string | null;
  }

  /** Represents a Media. */
  class Media implements IMedia {
    /**
     * Constructs a new Media.
     * @param [properties] Properties to set
     */
    constructor(properties?: echopages.IMedia);

    /** Media id. */
    public id: string;

    /** Media userId. */
    public userId: string;

    /** Media entryId. */
    public entryId: string;

    /** Media url. */
    public url: string;

    /** Media type. */
    public type: string;

    /** Media size. */
    public size: number | Long;

    /** Media createdAt. */
    public createdAt: string;

    /** Media updatedAt. */
    public updatedAt: string;

    /** Media isEncrypted. */
    public isEncrypted: boolean;

    /** Media metadata. */
    public metadata: string;

    /**
     * Creates a new Media instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Media instance
     */
    public static create(properties?: echopages.IMedia): echopages.Media;

    /**
     * Encodes the specified Media message. Does not implicitly {@link echopages.Media.verify|verify} messages.
     * @param message Media message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: echopages.IMedia, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Media message, length delimited. Does not implicitly {@link echopages.Media.verify|verify} messages.
     * @param message Media message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: echopages.IMedia,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a Media message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Media
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): echopages.Media;

    /**
     * Decodes a Media message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Media
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): echopages.Media;

    /**
     * Verifies a Media message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Media message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Media
     */
    public static fromObject(object: { [k: string]: any }): echopages.Media;

    /**
     * Creates a plain object from a Media message. Also converts values to other types if specified.
     * @param message Media
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: echopages.Media,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this Media to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Media
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }
}
