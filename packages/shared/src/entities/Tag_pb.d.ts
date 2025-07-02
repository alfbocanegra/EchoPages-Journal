import * as $protobuf from 'protobufjs';
import Long = require('long');
/** Namespace echopages. */
export namespace echopages {
  /** Properties of a Tag. */
  interface ITag {
    /** Tag id */
    id?: string | null;

    /** Tag userId */
    userId?: string | null;

    /** Tag name */
    name?: string | null;

    /** Tag color */
    color?: string | null;

    /** Tag createdAt */
    createdAt?: string | null;

    /** Tag updatedAt */
    updatedAt?: string | null;
  }

  /** Represents a Tag. */
  class Tag implements ITag {
    /**
     * Constructs a new Tag.
     * @param [properties] Properties to set
     */
    constructor(properties?: echopages.ITag);

    /** Tag id. */
    public id: string;

    /** Tag userId. */
    public userId: string;

    /** Tag name. */
    public name: string;

    /** Tag color. */
    public color: string;

    /** Tag createdAt. */
    public createdAt: string;

    /** Tag updatedAt. */
    public updatedAt: string;

    /**
     * Creates a new Tag instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Tag instance
     */
    public static create(properties?: echopages.ITag): echopages.Tag;

    /**
     * Encodes the specified Tag message. Does not implicitly {@link echopages.Tag.verify|verify} messages.
     * @param message Tag message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: echopages.ITag, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Tag message, length delimited. Does not implicitly {@link echopages.Tag.verify|verify} messages.
     * @param message Tag message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: echopages.ITag,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a Tag message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Tag
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): echopages.Tag;

    /**
     * Decodes a Tag message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Tag
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): echopages.Tag;

    /**
     * Verifies a Tag message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Tag message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Tag
     */
    public static fromObject(object: { [k: string]: any }): echopages.Tag;

    /**
     * Creates a plain object from a Tag message. Also converts values to other types if specified.
     * @param message Tag
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: echopages.Tag,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this Tag to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Tag
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }
}
