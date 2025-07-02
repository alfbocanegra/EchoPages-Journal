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

  echopages.Entry = (function () {
    /**
     * Properties of an Entry.
     * @memberof echopages
     * @interface IEntry
     * @property {string|null} [id] Entry id
     * @property {string|null} [userId] Entry userId
     * @property {string|null} [folderId] Entry folderId
     * @property {string|null} [title] Entry title
     * @property {string|null} [content] Entry content
     * @property {string|null} [contentType] Entry contentType
     * @property {boolean|null} [isEncrypted] Entry isEncrypted
     * @property {string|null} [mood] Entry mood
     * @property {string|null} [weather] Entry weather
     * @property {string|null} [location] Entry location
     * @property {boolean|null} [isFavorite] Entry isFavorite
     * @property {boolean|null} [isPinned] Entry isPinned
     * @property {string|null} [localId] Entry localId
     * @property {string|null} [syncStatus] Entry syncStatus
     * @property {string|null} [lastSyncAt] Entry lastSyncAt
     * @property {string|null} [createdAt] Entry createdAt
     * @property {string|null} [updatedAt] Entry updatedAt
     * @property {Array.<string>|null} [tags] Entry tags
     * @property {Array.<string>|null} [media] Entry media
     * @property {Array.<string>|null} [versions] Entry versions
     */

    /**
     * Constructs a new Entry.
     * @memberof echopages
     * @classdesc Represents an Entry.
     * @implements IEntry
     * @constructor
     * @param {echopages.IEntry=} [properties] Properties to set
     */
    function Entry(properties) {
      this.tags = [];
      this.media = [];
      this.versions = [];
      if (properties)
        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Entry id.
     * @member {string} id
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.id = '';

    /**
     * Entry userId.
     * @member {string} userId
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.userId = '';

    /**
     * Entry folderId.
     * @member {string} folderId
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.folderId = '';

    /**
     * Entry title.
     * @member {string} title
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.title = '';

    /**
     * Entry content.
     * @member {string} content
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.content = '';

    /**
     * Entry contentType.
     * @member {string} contentType
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.contentType = '';

    /**
     * Entry isEncrypted.
     * @member {boolean} isEncrypted
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.isEncrypted = false;

    /**
     * Entry mood.
     * @member {string} mood
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.mood = '';

    /**
     * Entry weather.
     * @member {string} weather
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.weather = '';

    /**
     * Entry location.
     * @member {string} location
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.location = '';

    /**
     * Entry isFavorite.
     * @member {boolean} isFavorite
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.isFavorite = false;

    /**
     * Entry isPinned.
     * @member {boolean} isPinned
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.isPinned = false;

    /**
     * Entry localId.
     * @member {string} localId
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.localId = '';

    /**
     * Entry syncStatus.
     * @member {string} syncStatus
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.syncStatus = '';

    /**
     * Entry lastSyncAt.
     * @member {string} lastSyncAt
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.lastSyncAt = '';

    /**
     * Entry createdAt.
     * @member {string} createdAt
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.createdAt = '';

    /**
     * Entry updatedAt.
     * @member {string} updatedAt
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.updatedAt = '';

    /**
     * Entry tags.
     * @member {Array.<string>} tags
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.tags = $util.emptyArray;

    /**
     * Entry media.
     * @member {Array.<string>} media
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.media = $util.emptyArray;

    /**
     * Entry versions.
     * @member {Array.<string>} versions
     * @memberof echopages.Entry
     * @instance
     */
    Entry.prototype.versions = $util.emptyArray;

    /**
     * Creates a new Entry instance using the specified properties.
     * @function create
     * @memberof echopages.Entry
     * @static
     * @param {echopages.IEntry=} [properties] Properties to set
     * @returns {echopages.Entry} Entry instance
     */
    Entry.create = function create(properties) {
      return new Entry(properties);
    };

    /**
     * Encodes the specified Entry message. Does not implicitly {@link echopages.Entry.verify|verify} messages.
     * @function encode
     * @memberof echopages.Entry
     * @static
     * @param {echopages.IEntry} message Entry message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Entry.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.id != null && Object.hasOwnProperty.call(message, 'id'))
        writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.id);
      if (message.userId != null && Object.hasOwnProperty.call(message, 'userId'))
        writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.userId);
      if (message.folderId != null && Object.hasOwnProperty.call(message, 'folderId'))
        writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.folderId);
      if (message.title != null && Object.hasOwnProperty.call(message, 'title'))
        writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.title);
      if (message.content != null && Object.hasOwnProperty.call(message, 'content'))
        writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.content);
      if (message.contentType != null && Object.hasOwnProperty.call(message, 'contentType'))
        writer.uint32(/* id 6, wireType 2 =*/ 50).string(message.contentType);
      if (message.isEncrypted != null && Object.hasOwnProperty.call(message, 'isEncrypted'))
        writer.uint32(/* id 7, wireType 0 =*/ 56).bool(message.isEncrypted);
      if (message.mood != null && Object.hasOwnProperty.call(message, 'mood'))
        writer.uint32(/* id 8, wireType 2 =*/ 66).string(message.mood);
      if (message.weather != null && Object.hasOwnProperty.call(message, 'weather'))
        writer.uint32(/* id 9, wireType 2 =*/ 74).string(message.weather);
      if (message.location != null && Object.hasOwnProperty.call(message, 'location'))
        writer.uint32(/* id 10, wireType 2 =*/ 82).string(message.location);
      if (message.isFavorite != null && Object.hasOwnProperty.call(message, 'isFavorite'))
        writer.uint32(/* id 11, wireType 0 =*/ 88).bool(message.isFavorite);
      if (message.isPinned != null && Object.hasOwnProperty.call(message, 'isPinned'))
        writer.uint32(/* id 12, wireType 0 =*/ 96).bool(message.isPinned);
      if (message.localId != null && Object.hasOwnProperty.call(message, 'localId'))
        writer.uint32(/* id 13, wireType 2 =*/ 106).string(message.localId);
      if (message.syncStatus != null && Object.hasOwnProperty.call(message, 'syncStatus'))
        writer.uint32(/* id 14, wireType 2 =*/ 114).string(message.syncStatus);
      if (message.lastSyncAt != null && Object.hasOwnProperty.call(message, 'lastSyncAt'))
        writer.uint32(/* id 15, wireType 2 =*/ 122).string(message.lastSyncAt);
      if (message.createdAt != null && Object.hasOwnProperty.call(message, 'createdAt'))
        writer.uint32(/* id 16, wireType 2 =*/ 130).string(message.createdAt);
      if (message.updatedAt != null && Object.hasOwnProperty.call(message, 'updatedAt'))
        writer.uint32(/* id 17, wireType 2 =*/ 138).string(message.updatedAt);
      if (message.tags != null && message.tags.length)
        for (var i = 0; i < message.tags.length; ++i)
          writer.uint32(/* id 18, wireType 2 =*/ 146).string(message.tags[i]);
      if (message.media != null && message.media.length)
        for (var i = 0; i < message.media.length; ++i)
          writer.uint32(/* id 19, wireType 2 =*/ 154).string(message.media[i]);
      if (message.versions != null && message.versions.length)
        for (var i = 0; i < message.versions.length; ++i)
          writer.uint32(/* id 20, wireType 2 =*/ 162).string(message.versions[i]);
      return writer;
    };

    /**
     * Encodes the specified Entry message, length delimited. Does not implicitly {@link echopages.Entry.verify|verify} messages.
     * @function encodeDelimited
     * @memberof echopages.Entry
     * @static
     * @param {echopages.IEntry} message Entry message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Entry.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an Entry message from the specified reader or buffer.
     * @function decode
     * @memberof echopages.Entry
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {echopages.Entry} Entry
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Entry.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      var end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.echopages.Entry();
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
            message.folderId = reader.string();
            break;
          }
          case 4: {
            message.title = reader.string();
            break;
          }
          case 5: {
            message.content = reader.string();
            break;
          }
          case 6: {
            message.contentType = reader.string();
            break;
          }
          case 7: {
            message.isEncrypted = reader.bool();
            break;
          }
          case 8: {
            message.mood = reader.string();
            break;
          }
          case 9: {
            message.weather = reader.string();
            break;
          }
          case 10: {
            message.location = reader.string();
            break;
          }
          case 11: {
            message.isFavorite = reader.bool();
            break;
          }
          case 12: {
            message.isPinned = reader.bool();
            break;
          }
          case 13: {
            message.localId = reader.string();
            break;
          }
          case 14: {
            message.syncStatus = reader.string();
            break;
          }
          case 15: {
            message.lastSyncAt = reader.string();
            break;
          }
          case 16: {
            message.createdAt = reader.string();
            break;
          }
          case 17: {
            message.updatedAt = reader.string();
            break;
          }
          case 18: {
            if (!(message.tags && message.tags.length)) message.tags = [];
            message.tags.push(reader.string());
            break;
          }
          case 19: {
            if (!(message.media && message.media.length)) message.media = [];
            message.media.push(reader.string());
            break;
          }
          case 20: {
            if (!(message.versions && message.versions.length)) message.versions = [];
            message.versions.push(reader.string());
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
     * Decodes an Entry message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof echopages.Entry
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {echopages.Entry} Entry
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Entry.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an Entry message.
     * @function verify
     * @memberof echopages.Entry
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Entry.verify = function verify(message) {
      if (typeof message !== 'object' || message === null) return 'object expected';
      if (message.id != null && message.hasOwnProperty('id'))
        if (!$util.isString(message.id)) return 'id: string expected';
      if (message.userId != null && message.hasOwnProperty('userId'))
        if (!$util.isString(message.userId)) return 'userId: string expected';
      if (message.folderId != null && message.hasOwnProperty('folderId'))
        if (!$util.isString(message.folderId)) return 'folderId: string expected';
      if (message.title != null && message.hasOwnProperty('title'))
        if (!$util.isString(message.title)) return 'title: string expected';
      if (message.content != null && message.hasOwnProperty('content'))
        if (!$util.isString(message.content)) return 'content: string expected';
      if (message.contentType != null && message.hasOwnProperty('contentType'))
        if (!$util.isString(message.contentType)) return 'contentType: string expected';
      if (message.isEncrypted != null && message.hasOwnProperty('isEncrypted'))
        if (typeof message.isEncrypted !== 'boolean') return 'isEncrypted: boolean expected';
      if (message.mood != null && message.hasOwnProperty('mood'))
        if (!$util.isString(message.mood)) return 'mood: string expected';
      if (message.weather != null && message.hasOwnProperty('weather'))
        if (!$util.isString(message.weather)) return 'weather: string expected';
      if (message.location != null && message.hasOwnProperty('location'))
        if (!$util.isString(message.location)) return 'location: string expected';
      if (message.isFavorite != null && message.hasOwnProperty('isFavorite'))
        if (typeof message.isFavorite !== 'boolean') return 'isFavorite: boolean expected';
      if (message.isPinned != null && message.hasOwnProperty('isPinned'))
        if (typeof message.isPinned !== 'boolean') return 'isPinned: boolean expected';
      if (message.localId != null && message.hasOwnProperty('localId'))
        if (!$util.isString(message.localId)) return 'localId: string expected';
      if (message.syncStatus != null && message.hasOwnProperty('syncStatus'))
        if (!$util.isString(message.syncStatus)) return 'syncStatus: string expected';
      if (message.lastSyncAt != null && message.hasOwnProperty('lastSyncAt'))
        if (!$util.isString(message.lastSyncAt)) return 'lastSyncAt: string expected';
      if (message.createdAt != null && message.hasOwnProperty('createdAt'))
        if (!$util.isString(message.createdAt)) return 'createdAt: string expected';
      if (message.updatedAt != null && message.hasOwnProperty('updatedAt'))
        if (!$util.isString(message.updatedAt)) return 'updatedAt: string expected';
      if (message.tags != null && message.hasOwnProperty('tags')) {
        if (!Array.isArray(message.tags)) return 'tags: array expected';
        for (var i = 0; i < message.tags.length; ++i)
          if (!$util.isString(message.tags[i])) return 'tags: string[] expected';
      }
      if (message.media != null && message.hasOwnProperty('media')) {
        if (!Array.isArray(message.media)) return 'media: array expected';
        for (var i = 0; i < message.media.length; ++i)
          if (!$util.isString(message.media[i])) return 'media: string[] expected';
      }
      if (message.versions != null && message.hasOwnProperty('versions')) {
        if (!Array.isArray(message.versions)) return 'versions: array expected';
        for (var i = 0; i < message.versions.length; ++i)
          if (!$util.isString(message.versions[i])) return 'versions: string[] expected';
      }
      return null;
    };

    /**
     * Creates an Entry message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof echopages.Entry
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {echopages.Entry} Entry
     */
    Entry.fromObject = function fromObject(object) {
      if (object instanceof $root.echopages.Entry) return object;
      var message = new $root.echopages.Entry();
      if (object.id != null) message.id = String(object.id);
      if (object.userId != null) message.userId = String(object.userId);
      if (object.folderId != null) message.folderId = String(object.folderId);
      if (object.title != null) message.title = String(object.title);
      if (object.content != null) message.content = String(object.content);
      if (object.contentType != null) message.contentType = String(object.contentType);
      if (object.isEncrypted != null) message.isEncrypted = Boolean(object.isEncrypted);
      if (object.mood != null) message.mood = String(object.mood);
      if (object.weather != null) message.weather = String(object.weather);
      if (object.location != null) message.location = String(object.location);
      if (object.isFavorite != null) message.isFavorite = Boolean(object.isFavorite);
      if (object.isPinned != null) message.isPinned = Boolean(object.isPinned);
      if (object.localId != null) message.localId = String(object.localId);
      if (object.syncStatus != null) message.syncStatus = String(object.syncStatus);
      if (object.lastSyncAt != null) message.lastSyncAt = String(object.lastSyncAt);
      if (object.createdAt != null) message.createdAt = String(object.createdAt);
      if (object.updatedAt != null) message.updatedAt = String(object.updatedAt);
      if (object.tags) {
        if (!Array.isArray(object.tags)) throw TypeError('.echopages.Entry.tags: array expected');
        message.tags = [];
        for (var i = 0; i < object.tags.length; ++i) message.tags[i] = String(object.tags[i]);
      }
      if (object.media) {
        if (!Array.isArray(object.media)) throw TypeError('.echopages.Entry.media: array expected');
        message.media = [];
        for (var i = 0; i < object.media.length; ++i) message.media[i] = String(object.media[i]);
      }
      if (object.versions) {
        if (!Array.isArray(object.versions))
          throw TypeError('.echopages.Entry.versions: array expected');
        message.versions = [];
        for (var i = 0; i < object.versions.length; ++i)
          message.versions[i] = String(object.versions[i]);
      }
      return message;
    };

    /**
     * Creates a plain object from an Entry message. Also converts values to other types if specified.
     * @function toObject
     * @memberof echopages.Entry
     * @static
     * @param {echopages.Entry} message Entry
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Entry.toObject = function toObject(message, options) {
      if (!options) options = {};
      var object = {};
      if (options.arrays || options.defaults) {
        object.tags = [];
        object.media = [];
        object.versions = [];
      }
      if (options.defaults) {
        object.id = '';
        object.userId = '';
        object.folderId = '';
        object.title = '';
        object.content = '';
        object.contentType = '';
        object.isEncrypted = false;
        object.mood = '';
        object.weather = '';
        object.location = '';
        object.isFavorite = false;
        object.isPinned = false;
        object.localId = '';
        object.syncStatus = '';
        object.lastSyncAt = '';
        object.createdAt = '';
        object.updatedAt = '';
      }
      if (message.id != null && message.hasOwnProperty('id')) object.id = message.id;
      if (message.userId != null && message.hasOwnProperty('userId'))
        object.userId = message.userId;
      if (message.folderId != null && message.hasOwnProperty('folderId'))
        object.folderId = message.folderId;
      if (message.title != null && message.hasOwnProperty('title')) object.title = message.title;
      if (message.content != null && message.hasOwnProperty('content'))
        object.content = message.content;
      if (message.contentType != null && message.hasOwnProperty('contentType'))
        object.contentType = message.contentType;
      if (message.isEncrypted != null && message.hasOwnProperty('isEncrypted'))
        object.isEncrypted = message.isEncrypted;
      if (message.mood != null && message.hasOwnProperty('mood')) object.mood = message.mood;
      if (message.weather != null && message.hasOwnProperty('weather'))
        object.weather = message.weather;
      if (message.location != null && message.hasOwnProperty('location'))
        object.location = message.location;
      if (message.isFavorite != null && message.hasOwnProperty('isFavorite'))
        object.isFavorite = message.isFavorite;
      if (message.isPinned != null && message.hasOwnProperty('isPinned'))
        object.isPinned = message.isPinned;
      if (message.localId != null && message.hasOwnProperty('localId'))
        object.localId = message.localId;
      if (message.syncStatus != null && message.hasOwnProperty('syncStatus'))
        object.syncStatus = message.syncStatus;
      if (message.lastSyncAt != null && message.hasOwnProperty('lastSyncAt'))
        object.lastSyncAt = message.lastSyncAt;
      if (message.createdAt != null && message.hasOwnProperty('createdAt'))
        object.createdAt = message.createdAt;
      if (message.updatedAt != null && message.hasOwnProperty('updatedAt'))
        object.updatedAt = message.updatedAt;
      if (message.tags && message.tags.length) {
        object.tags = [];
        for (var j = 0; j < message.tags.length; ++j) object.tags[j] = message.tags[j];
      }
      if (message.media && message.media.length) {
        object.media = [];
        for (var j = 0; j < message.media.length; ++j) object.media[j] = message.media[j];
      }
      if (message.versions && message.versions.length) {
        object.versions = [];
        for (var j = 0; j < message.versions.length; ++j) object.versions[j] = message.versions[j];
      }
      return object;
    };

    /**
     * Converts this Entry to JSON.
     * @function toJSON
     * @memberof echopages.Entry
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Entry.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Entry
     * @function getTypeUrl
     * @memberof echopages.Entry
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Entry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/echopages.Entry';
    };

    return Entry;
  })();

  return echopages;
})();

module.exports = $root;
