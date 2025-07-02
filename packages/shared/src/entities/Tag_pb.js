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

  echopages.Tag = (function () {
    /**
     * Properties of a Tag.
     * @memberof echopages
     * @interface ITag
     * @property {string|null} [id] Tag id
     * @property {string|null} [userId] Tag userId
     * @property {string|null} [name] Tag name
     * @property {string|null} [color] Tag color
     * @property {string|null} [createdAt] Tag createdAt
     * @property {string|null} [updatedAt] Tag updatedAt
     */

    /**
     * Constructs a new Tag.
     * @memberof echopages
     * @classdesc Represents a Tag.
     * @implements ITag
     * @constructor
     * @param {echopages.ITag=} [properties] Properties to set
     */
    function Tag(properties) {
      if (properties)
        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Tag id.
     * @member {string} id
     * @memberof echopages.Tag
     * @instance
     */
    Tag.prototype.id = '';

    /**
     * Tag userId.
     * @member {string} userId
     * @memberof echopages.Tag
     * @instance
     */
    Tag.prototype.userId = '';

    /**
     * Tag name.
     * @member {string} name
     * @memberof echopages.Tag
     * @instance
     */
    Tag.prototype.name = '';

    /**
     * Tag color.
     * @member {string} color
     * @memberof echopages.Tag
     * @instance
     */
    Tag.prototype.color = '';

    /**
     * Tag createdAt.
     * @member {string} createdAt
     * @memberof echopages.Tag
     * @instance
     */
    Tag.prototype.createdAt = '';

    /**
     * Tag updatedAt.
     * @member {string} updatedAt
     * @memberof echopages.Tag
     * @instance
     */
    Tag.prototype.updatedAt = '';

    /**
     * Creates a new Tag instance using the specified properties.
     * @function create
     * @memberof echopages.Tag
     * @static
     * @param {echopages.ITag=} [properties] Properties to set
     * @returns {echopages.Tag} Tag instance
     */
    Tag.create = function create(properties) {
      return new Tag(properties);
    };

    /**
     * Encodes the specified Tag message. Does not implicitly {@link echopages.Tag.verify|verify} messages.
     * @function encode
     * @memberof echopages.Tag
     * @static
     * @param {echopages.ITag} message Tag message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Tag.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.id != null && Object.hasOwnProperty.call(message, 'id'))
        writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.id);
      if (message.userId != null && Object.hasOwnProperty.call(message, 'userId'))
        writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.userId);
      if (message.name != null && Object.hasOwnProperty.call(message, 'name'))
        writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.name);
      if (message.color != null && Object.hasOwnProperty.call(message, 'color'))
        writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.color);
      if (message.createdAt != null && Object.hasOwnProperty.call(message, 'createdAt'))
        writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.createdAt);
      if (message.updatedAt != null && Object.hasOwnProperty.call(message, 'updatedAt'))
        writer.uint32(/* id 6, wireType 2 =*/ 50).string(message.updatedAt);
      return writer;
    };

    /**
     * Encodes the specified Tag message, length delimited. Does not implicitly {@link echopages.Tag.verify|verify} messages.
     * @function encodeDelimited
     * @memberof echopages.Tag
     * @static
     * @param {echopages.ITag} message Tag message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Tag.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Tag message from the specified reader or buffer.
     * @function decode
     * @memberof echopages.Tag
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {echopages.Tag} Tag
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Tag.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      var end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.echopages.Tag();
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
            message.name = reader.string();
            break;
          }
          case 4: {
            message.color = reader.string();
            break;
          }
          case 5: {
            message.createdAt = reader.string();
            break;
          }
          case 6: {
            message.updatedAt = reader.string();
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
     * Decodes a Tag message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof echopages.Tag
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {echopages.Tag} Tag
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Tag.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Tag message.
     * @function verify
     * @memberof echopages.Tag
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Tag.verify = function verify(message) {
      if (typeof message !== 'object' || message === null) return 'object expected';
      if (message.id != null && message.hasOwnProperty('id'))
        if (!$util.isString(message.id)) return 'id: string expected';
      if (message.userId != null && message.hasOwnProperty('userId'))
        if (!$util.isString(message.userId)) return 'userId: string expected';
      if (message.name != null && message.hasOwnProperty('name'))
        if (!$util.isString(message.name)) return 'name: string expected';
      if (message.color != null && message.hasOwnProperty('color'))
        if (!$util.isString(message.color)) return 'color: string expected';
      if (message.createdAt != null && message.hasOwnProperty('createdAt'))
        if (!$util.isString(message.createdAt)) return 'createdAt: string expected';
      if (message.updatedAt != null && message.hasOwnProperty('updatedAt'))
        if (!$util.isString(message.updatedAt)) return 'updatedAt: string expected';
      return null;
    };

    /**
     * Creates a Tag message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof echopages.Tag
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {echopages.Tag} Tag
     */
    Tag.fromObject = function fromObject(object) {
      if (object instanceof $root.echopages.Tag) return object;
      var message = new $root.echopages.Tag();
      if (object.id != null) message.id = String(object.id);
      if (object.userId != null) message.userId = String(object.userId);
      if (object.name != null) message.name = String(object.name);
      if (object.color != null) message.color = String(object.color);
      if (object.createdAt != null) message.createdAt = String(object.createdAt);
      if (object.updatedAt != null) message.updatedAt = String(object.updatedAt);
      return message;
    };

    /**
     * Creates a plain object from a Tag message. Also converts values to other types if specified.
     * @function toObject
     * @memberof echopages.Tag
     * @static
     * @param {echopages.Tag} message Tag
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Tag.toObject = function toObject(message, options) {
      if (!options) options = {};
      var object = {};
      if (options.defaults) {
        object.id = '';
        object.userId = '';
        object.name = '';
        object.color = '';
        object.createdAt = '';
        object.updatedAt = '';
      }
      if (message.id != null && message.hasOwnProperty('id')) object.id = message.id;
      if (message.userId != null && message.hasOwnProperty('userId'))
        object.userId = message.userId;
      if (message.name != null && message.hasOwnProperty('name')) object.name = message.name;
      if (message.color != null && message.hasOwnProperty('color')) object.color = message.color;
      if (message.createdAt != null && message.hasOwnProperty('createdAt'))
        object.createdAt = message.createdAt;
      if (message.updatedAt != null && message.hasOwnProperty('updatedAt'))
        object.updatedAt = message.updatedAt;
      return object;
    };

    /**
     * Converts this Tag to JSON.
     * @function toJSON
     * @memberof echopages.Tag
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Tag.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Tag
     * @function getTypeUrl
     * @memberof echopages.Tag
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Tag.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/echopages.Tag';
    };

    return Tag;
  })();

  return echopages;
})();

module.exports = $root;
