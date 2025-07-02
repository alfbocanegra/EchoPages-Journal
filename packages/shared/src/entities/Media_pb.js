/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
'use strict';

var $protobuf = require('protobufjs/minimal');

// Common aliases
var $Reader = $protobuf.Reader,
  $Writer = $protobuf.Writer,
  $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots['default'] || ($protobuf.roots['default'] = {});

$root.echopages = (function () {
  /**
   * Namespace echopages.
   * @exports echopages
   * @namespace
   */
  var echopages = {};

  echopages.Media = (function () {
    /**
     * Properties of a Media.
     * @memberof echopages
     * @interface IMedia
     * @property {string|null} [id] Media id
     * @property {string|null} [userId] Media userId
     * @property {string|null} [entryId] Media entryId
     * @property {string|null} [url] Media url
     * @property {string|null} [type] Media type
     * @property {number|Long|null} [size] Media size
     * @property {string|null} [createdAt] Media createdAt
     * @property {string|null} [updatedAt] Media updatedAt
     * @property {boolean|null} [isEncrypted] Media isEncrypted
     * @property {string|null} [metadata] Media metadata
     */

    /**
     * Constructs a new Media.
     * @memberof echopages
     * @classdesc Represents a Media.
     * @implements IMedia
     * @constructor
     * @param {echopages.IMedia=} [properties] Properties to set
     */
    function Media(properties) {
      if (properties)
        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Media id.
     * @member {string} id
     * @memberof echopages.Media
     * @instance
     */
    Media.prototype.id = '';

    /**
     * Media userId.
     * @member {string} userId
     * @memberof echopages.Media
     * @instance
     */
    Media.prototype.userId = '';

    /**
     * Media entryId.
     * @member {string} entryId
     * @memberof echopages.Media
     * @instance
     */
    Media.prototype.entryId = '';

    /**
     * Media url.
     * @member {string} url
     * @memberof echopages.Media
     * @instance
     */
    Media.prototype.url = '';

    /**
     * Media type.
     * @member {string} type
     * @memberof echopages.Media
     * @instance
     */
    Media.prototype.type = '';

    /**
     * Media size.
     * @member {number|Long} size
     * @memberof echopages.Media
     * @instance
     */
    Media.prototype.size = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;

    /**
     * Media createdAt.
     * @member {string} createdAt
     * @memberof echopages.Media
     * @instance
     */
    Media.prototype.createdAt = '';

    /**
     * Media updatedAt.
     * @member {string} updatedAt
     * @memberof echopages.Media
     * @instance
     */
    Media.prototype.updatedAt = '';

    /**
     * Media isEncrypted.
     * @member {boolean} isEncrypted
     * @memberof echopages.Media
     * @instance
     */
    Media.prototype.isEncrypted = false;

    /**
     * Media metadata.
     * @member {string} metadata
     * @memberof echopages.Media
     * @instance
     */
    Media.prototype.metadata = '';

    /**
     * Creates a new Media instance using the specified properties.
     * @function create
     * @memberof echopages.Media
     * @static
     * @param {echopages.IMedia=} [properties] Properties to set
     * @returns {echopages.Media} Media instance
     */
    Media.create = function create(properties) {
      return new Media(properties);
    };

    /**
     * Encodes the specified Media message. Does not implicitly {@link echopages.Media.verify|verify} messages.
     * @function encode
     * @memberof echopages.Media
     * @static
     * @param {echopages.IMedia} message Media message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Media.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.id != null && Object.hasOwnProperty.call(message, 'id'))
        writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.id);
      if (message.userId != null && Object.hasOwnProperty.call(message, 'userId'))
        writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.userId);
      if (message.entryId != null && Object.hasOwnProperty.call(message, 'entryId'))
        writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.entryId);
      if (message.url != null && Object.hasOwnProperty.call(message, 'url'))
        writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.url);
      if (message.type != null && Object.hasOwnProperty.call(message, 'type'))
        writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.type);
      if (message.size != null && Object.hasOwnProperty.call(message, 'size'))
        writer.uint32(/* id 6, wireType 0 =*/ 48).int64(message.size);
      if (message.createdAt != null && Object.hasOwnProperty.call(message, 'createdAt'))
        writer.uint32(/* id 7, wireType 2 =*/ 58).string(message.createdAt);
      if (message.updatedAt != null && Object.hasOwnProperty.call(message, 'updatedAt'))
        writer.uint32(/* id 8, wireType 2 =*/ 66).string(message.updatedAt);
      if (message.isEncrypted != null && Object.hasOwnProperty.call(message, 'isEncrypted'))
        writer.uint32(/* id 9, wireType 0 =*/ 72).bool(message.isEncrypted);
      if (message.metadata != null && Object.hasOwnProperty.call(message, 'metadata'))
        writer.uint32(/* id 10, wireType 2 =*/ 82).string(message.metadata);
      return writer;
    };

    /**
     * Encodes the specified Media message, length delimited. Does not implicitly {@link echopages.Media.verify|verify} messages.
     * @function encodeDelimited
     * @memberof echopages.Media
     * @static
     * @param {echopages.IMedia} message Media message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Media.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Media message from the specified reader or buffer.
     * @function decode
     * @memberof echopages.Media
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {echopages.Media} Media
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Media.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      var end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.echopages.Media();
      while (reader.pos < end) {
        var tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.id = reader.string();
            break;
          }
          case 2: {
            message.userId = reader.string();
            break;
          }
          case 3: {
            message.entryId = reader.string();
            break;
          }
          case 4: {
            message.url = reader.string();
            break;
          }
          case 5: {
            message.type = reader.string();
            break;
          }
          case 6: {
            message.size = reader.int64();
            break;
          }
          case 7: {
            message.createdAt = reader.string();
            break;
          }
          case 8: {
            message.updatedAt = reader.string();
            break;
          }
          case 9: {
            message.isEncrypted = reader.bool();
            break;
          }
          case 10: {
            message.metadata = reader.string();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a Media message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof echopages.Media
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {echopages.Media} Media
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Media.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Media message.
     * @function verify
     * @memberof echopages.Media
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Media.verify = function verify(message) {
      if (typeof message !== 'object' || message === null) return 'object expected';
      if (message.id != null && message.hasOwnProperty('id'))
        if (!$util.isString(message.id)) return 'id: string expected';
      if (message.userId != null && message.hasOwnProperty('userId'))
        if (!$util.isString(message.userId)) return 'userId: string expected';
      if (message.entryId != null && message.hasOwnProperty('entryId'))
        if (!$util.isString(message.entryId)) return 'entryId: string expected';
      if (message.url != null && message.hasOwnProperty('url'))
        if (!$util.isString(message.url)) return 'url: string expected';
      if (message.type != null && message.hasOwnProperty('type'))
        if (!$util.isString(message.type)) return 'type: string expected';
      if (message.size != null && message.hasOwnProperty('size'))
        if (
          !$util.isInteger(message.size) &&
          !(message.size && $util.isInteger(message.size.low) && $util.isInteger(message.size.high))
        )
          return 'size: integer|Long expected';
      if (message.createdAt != null && message.hasOwnProperty('createdAt'))
        if (!$util.isString(message.createdAt)) return 'createdAt: string expected';
      if (message.updatedAt != null && message.hasOwnProperty('updatedAt'))
        if (!$util.isString(message.updatedAt)) return 'updatedAt: string expected';
      if (message.isEncrypted != null && message.hasOwnProperty('isEncrypted'))
        if (typeof message.isEncrypted !== 'boolean') return 'isEncrypted: boolean expected';
      if (message.metadata != null && message.hasOwnProperty('metadata'))
        if (!$util.isString(message.metadata)) return 'metadata: string expected';
      return null;
    };

    /**
     * Creates a Media message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof echopages.Media
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {echopages.Media} Media
     */
    Media.fromObject = function fromObject(object) {
      if (object instanceof $root.echopages.Media) return object;
      var message = new $root.echopages.Media();
      if (object.id != null) message.id = String(object.id);
      if (object.userId != null) message.userId = String(object.userId);
      if (object.entryId != null) message.entryId = String(object.entryId);
      if (object.url != null) message.url = String(object.url);
      if (object.type != null) message.type = String(object.type);
      if (object.size != null)
        if ($util.Long) (message.size = $util.Long.fromValue(object.size)).unsigned = false;
        else if (typeof object.size === 'string') message.size = parseInt(object.size, 10);
        else if (typeof object.size === 'number') message.size = object.size;
        else if (typeof object.size === 'object')
          message.size = new $util.LongBits(
            object.size.low >>> 0,
            object.size.high >>> 0
          ).toNumber();
      if (object.createdAt != null) message.createdAt = String(object.createdAt);
      if (object.updatedAt != null) message.updatedAt = String(object.updatedAt);
      if (object.isEncrypted != null) message.isEncrypted = Boolean(object.isEncrypted);
      if (object.metadata != null) message.metadata = String(object.metadata);
      return message;
    };

    /**
     * Creates a plain object from a Media message. Also converts values to other types if specified.
     * @function toObject
     * @memberof echopages.Media
     * @static
     * @param {echopages.Media} message Media
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Media.toObject = function toObject(message, options) {
      if (!options) options = {};
      var object = {};
      if (options.defaults) {
        object.id = '';
        object.userId = '';
        object.entryId = '';
        object.url = '';
        object.type = '';
        if ($util.Long) {
          var long = new $util.Long(0, 0, false);
          object.size =
            options.longs === String
              ? long.toString()
              : options.longs === Number
              ? long.toNumber()
              : long;
        } else object.size = options.longs === String ? '0' : 0;
        object.createdAt = '';
        object.updatedAt = '';
        object.isEncrypted = false;
        object.metadata = '';
      }
      if (message.id != null && message.hasOwnProperty('id')) object.id = message.id;
      if (message.userId != null && message.hasOwnProperty('userId'))
        object.userId = message.userId;
      if (message.entryId != null && message.hasOwnProperty('entryId'))
        object.entryId = message.entryId;
      if (message.url != null && message.hasOwnProperty('url')) object.url = message.url;
      if (message.type != null && message.hasOwnProperty('type')) object.type = message.type;
      if (message.size != null && message.hasOwnProperty('size'))
        if (typeof message.size === 'number')
          object.size = options.longs === String ? String(message.size) : message.size;
        else
          object.size =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.size)
              : options.longs === Number
              ? new $util.LongBits(message.size.low >>> 0, message.size.high >>> 0).toNumber()
              : message.size;
      if (message.createdAt != null && message.hasOwnProperty('createdAt'))
        object.createdAt = message.createdAt;
      if (message.updatedAt != null && message.hasOwnProperty('updatedAt'))
        object.updatedAt = message.updatedAt;
      if (message.isEncrypted != null && message.hasOwnProperty('isEncrypted'))
        object.isEncrypted = message.isEncrypted;
      if (message.metadata != null && message.hasOwnProperty('metadata'))
        object.metadata = message.metadata;
      return object;
    };

    /**
     * Converts this Media to JSON.
     * @function toJSON
     * @memberof echopages.Media
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Media.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Media
     * @function getTypeUrl
     * @memberof echopages.Media
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Media.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/echopages.Media';
    };

    return Media;
  })();

  return echopages;
})();

module.exports = $root;
