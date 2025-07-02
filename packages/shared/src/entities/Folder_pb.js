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

  echopages.Folder = (function () {
    /**
     * Properties of a Folder.
     * @memberof echopages
     * @interface IFolder
     * @property {string|null} [id] Folder id
     * @property {string|null} [userId] Folder userId
     * @property {string|null} [name] Folder name
     * @property {string|null} [parentId] Folder parentId
     * @property {string|null} [createdAt] Folder createdAt
     * @property {string|null} [updatedAt] Folder updatedAt
     * @property {boolean|null} [isEncrypted] Folder isEncrypted
     * @property {boolean|null} [isFavorite] Folder isFavorite
     * @property {boolean|null} [isPinned] Folder isPinned
     * @property {Array.<string>|null} [tags] Folder tags
     */

    /**
     * Constructs a new Folder.
     * @memberof echopages
     * @classdesc Represents a Folder.
     * @implements IFolder
     * @constructor
     * @param {echopages.IFolder=} [properties] Properties to set
     */
    function Folder(properties) {
      this.tags = [];
      if (properties)
        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Folder id.
     * @member {string} id
     * @memberof echopages.Folder
     * @instance
     */
    Folder.prototype.id = '';

    /**
     * Folder userId.
     * @member {string} userId
     * @memberof echopages.Folder
     * @instance
     */
    Folder.prototype.userId = '';

    /**
     * Folder name.
     * @member {string} name
     * @memberof echopages.Folder
     * @instance
     */
    Folder.prototype.name = '';

    /**
     * Folder parentId.
     * @member {string} parentId
     * @memberof echopages.Folder
     * @instance
     */
    Folder.prototype.parentId = '';

    /**
     * Folder createdAt.
     * @member {string} createdAt
     * @memberof echopages.Folder
     * @instance
     */
    Folder.prototype.createdAt = '';

    /**
     * Folder updatedAt.
     * @member {string} updatedAt
     * @memberof echopages.Folder
     * @instance
     */
    Folder.prototype.updatedAt = '';

    /**
     * Folder isEncrypted.
     * @member {boolean} isEncrypted
     * @memberof echopages.Folder
     * @instance
     */
    Folder.prototype.isEncrypted = false;

    /**
     * Folder isFavorite.
     * @member {boolean} isFavorite
     * @memberof echopages.Folder
     * @instance
     */
    Folder.prototype.isFavorite = false;

    /**
     * Folder isPinned.
     * @member {boolean} isPinned
     * @memberof echopages.Folder
     * @instance
     */
    Folder.prototype.isPinned = false;

    /**
     * Folder tags.
     * @member {Array.<string>} tags
     * @memberof echopages.Folder
     * @instance
     */
    Folder.prototype.tags = $util.emptyArray;

    /**
     * Creates a new Folder instance using the specified properties.
     * @function create
     * @memberof echopages.Folder
     * @static
     * @param {echopages.IFolder=} [properties] Properties to set
     * @returns {echopages.Folder} Folder instance
     */
    Folder.create = function create(properties) {
      return new Folder(properties);
    };

    /**
     * Encodes the specified Folder message. Does not implicitly {@link echopages.Folder.verify|verify} messages.
     * @function encode
     * @memberof echopages.Folder
     * @static
     * @param {echopages.IFolder} message Folder message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Folder.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.id != null && Object.hasOwnProperty.call(message, 'id'))
        writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.id);
      if (message.userId != null && Object.hasOwnProperty.call(message, 'userId'))
        writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.userId);
      if (message.name != null && Object.hasOwnProperty.call(message, 'name'))
        writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.name);
      if (message.parentId != null && Object.hasOwnProperty.call(message, 'parentId'))
        writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.parentId);
      if (message.createdAt != null && Object.hasOwnProperty.call(message, 'createdAt'))
        writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.createdAt);
      if (message.updatedAt != null && Object.hasOwnProperty.call(message, 'updatedAt'))
        writer.uint32(/* id 6, wireType 2 =*/ 50).string(message.updatedAt);
      if (message.isEncrypted != null && Object.hasOwnProperty.call(message, 'isEncrypted'))
        writer.uint32(/* id 7, wireType 0 =*/ 56).bool(message.isEncrypted);
      if (message.isFavorite != null && Object.hasOwnProperty.call(message, 'isFavorite'))
        writer.uint32(/* id 8, wireType 0 =*/ 64).bool(message.isFavorite);
      if (message.isPinned != null && Object.hasOwnProperty.call(message, 'isPinned'))
        writer.uint32(/* id 9, wireType 0 =*/ 72).bool(message.isPinned);
      if (message.tags != null && message.tags.length)
        for (var i = 0; i < message.tags.length; ++i)
          writer.uint32(/* id 10, wireType 2 =*/ 82).string(message.tags[i]);
      return writer;
    };

    /**
     * Encodes the specified Folder message, length delimited. Does not implicitly {@link echopages.Folder.verify|verify} messages.
     * @function encodeDelimited
     * @memberof echopages.Folder
     * @static
     * @param {echopages.IFolder} message Folder message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Folder.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Folder message from the specified reader or buffer.
     * @function decode
     * @memberof echopages.Folder
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {echopages.Folder} Folder
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Folder.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      var end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.echopages.Folder();
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
            message.parentId = reader.string();
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
          case 7: {
            message.isEncrypted = reader.bool();
            break;
          }
          case 8: {
            message.isFavorite = reader.bool();
            break;
          }
          case 9: {
            message.isPinned = reader.bool();
            break;
          }
          case 10: {
            if (!(message.tags && message.tags.length)) message.tags = [];
            message.tags.push(reader.string());
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
     * Decodes a Folder message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof echopages.Folder
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {echopages.Folder} Folder
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Folder.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Folder message.
     * @function verify
     * @memberof echopages.Folder
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Folder.verify = function verify(message) {
      if (typeof message !== 'object' || message === null) return 'object expected';
      if (message.id != null && message.hasOwnProperty('id'))
        if (!$util.isString(message.id)) return 'id: string expected';
      if (message.userId != null && message.hasOwnProperty('userId'))
        if (!$util.isString(message.userId)) return 'userId: string expected';
      if (message.name != null && message.hasOwnProperty('name'))
        if (!$util.isString(message.name)) return 'name: string expected';
      if (message.parentId != null && message.hasOwnProperty('parentId'))
        if (!$util.isString(message.parentId)) return 'parentId: string expected';
      if (message.createdAt != null && message.hasOwnProperty('createdAt'))
        if (!$util.isString(message.createdAt)) return 'createdAt: string expected';
      if (message.updatedAt != null && message.hasOwnProperty('updatedAt'))
        if (!$util.isString(message.updatedAt)) return 'updatedAt: string expected';
      if (message.isEncrypted != null && message.hasOwnProperty('isEncrypted'))
        if (typeof message.isEncrypted !== 'boolean') return 'isEncrypted: boolean expected';
      if (message.isFavorite != null && message.hasOwnProperty('isFavorite'))
        if (typeof message.isFavorite !== 'boolean') return 'isFavorite: boolean expected';
      if (message.isPinned != null && message.hasOwnProperty('isPinned'))
        if (typeof message.isPinned !== 'boolean') return 'isPinned: boolean expected';
      if (message.tags != null && message.hasOwnProperty('tags')) {
        if (!Array.isArray(message.tags)) return 'tags: array expected';
        for (var i = 0; i < message.tags.length; ++i)
          if (!$util.isString(message.tags[i])) return 'tags: string[] expected';
      }
      return null;
    };

    /**
     * Creates a Folder message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof echopages.Folder
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {echopages.Folder} Folder
     */
    Folder.fromObject = function fromObject(object) {
      if (object instanceof $root.echopages.Folder) return object;
      var message = new $root.echopages.Folder();
      if (object.id != null) message.id = String(object.id);
      if (object.userId != null) message.userId = String(object.userId);
      if (object.name != null) message.name = String(object.name);
      if (object.parentId != null) message.parentId = String(object.parentId);
      if (object.createdAt != null) message.createdAt = String(object.createdAt);
      if (object.updatedAt != null) message.updatedAt = String(object.updatedAt);
      if (object.isEncrypted != null) message.isEncrypted = Boolean(object.isEncrypted);
      if (object.isFavorite != null) message.isFavorite = Boolean(object.isFavorite);
      if (object.isPinned != null) message.isPinned = Boolean(object.isPinned);
      if (object.tags) {
        if (!Array.isArray(object.tags)) throw TypeError('.echopages.Folder.tags: array expected');
        message.tags = [];
        for (var i = 0; i < object.tags.length; ++i) message.tags[i] = String(object.tags[i]);
      }
      return message;
    };

    /**
     * Creates a plain object from a Folder message. Also converts values to other types if specified.
     * @function toObject
     * @memberof echopages.Folder
     * @static
     * @param {echopages.Folder} message Folder
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Folder.toObject = function toObject(message, options) {
      if (!options) options = {};
      var object = {};
      if (options.arrays || options.defaults) object.tags = [];
      if (options.defaults) {
        object.id = '';
        object.userId = '';
        object.name = '';
        object.parentId = '';
        object.createdAt = '';
        object.updatedAt = '';
        object.isEncrypted = false;
        object.isFavorite = false;
        object.isPinned = false;
      }
      if (message.id != null && message.hasOwnProperty('id')) object.id = message.id;
      if (message.userId != null && message.hasOwnProperty('userId'))
        object.userId = message.userId;
      if (message.name != null && message.hasOwnProperty('name')) object.name = message.name;
      if (message.parentId != null && message.hasOwnProperty('parentId'))
        object.parentId = message.parentId;
      if (message.createdAt != null && message.hasOwnProperty('createdAt'))
        object.createdAt = message.createdAt;
      if (message.updatedAt != null && message.hasOwnProperty('updatedAt'))
        object.updatedAt = message.updatedAt;
      if (message.isEncrypted != null && message.hasOwnProperty('isEncrypted'))
        object.isEncrypted = message.isEncrypted;
      if (message.isFavorite != null && message.hasOwnProperty('isFavorite'))
        object.isFavorite = message.isFavorite;
      if (message.isPinned != null && message.hasOwnProperty('isPinned'))
        object.isPinned = message.isPinned;
      if (message.tags && message.tags.length) {
        object.tags = [];
        for (var j = 0; j < message.tags.length; ++j) object.tags[j] = message.tags[j];
      }
      return object;
    };

    /**
     * Converts this Folder to JSON.
     * @function toJSON
     * @memberof echopages.Folder
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Folder.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Folder
     * @function getTypeUrl
     * @memberof echopages.Folder
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Folder.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/echopages.Folder';
    };

    return Folder;
  })();

  return echopages;
})();

module.exports = $root;
