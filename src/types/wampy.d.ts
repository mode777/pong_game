export default Wampy;
/**
 * WAMP Client Class
 */
export class Wampy {
    /**
     * Wampy constructor
     * @param {string} [url]
     * @param {Object} [options]
     */
    constructor(url?: string, options?: any);
    /**
     * Wampy version
     * @type {string}
     * @private
     */
    private version;
    /**
     * WS Url
     * @type {string}
     * @private
     */
    private _url;
    /**
     * WS protocols
     * @type {Array}
     * @private
     */
    private _protocols;
    /**
     * WAMP features, supported by Wampy
     * @type {object}
     * @private
     */
    private _wamp_features;
    /**
     * Internal cache for object lifetime
     * @type {Object}
     * @private
     */
    private _cache;
    /**
     * WebSocket object
     * @type {WebSocket}
     * @private
     */
    private _ws;
    /**
     * Internal queue for websocket requests, for case of disconnect
     * @type {Array}
     * @private
     */
    private _wsQueue;
    /**
     * Internal queue for wamp requests
     * @type {object}
     * @private
     */
    private _requests;
    /**
     * Stored RPC
     * @type {object}
     * @private
     */
    private _calls;
    /**
     * Stored Pub/Subs to access by ID
     * @type {Map}
     * @private
     */
    private _subscriptionsById;
    /**
     * Stored Pub/Subs to access by Key
     * @type {Map}
     * @private
     */
    private _subscriptionsByKey;
    /**
     * Stored RPC Registrations
     * @type {object}
     * @private
     */
    private _rpcRegs;
    /**
     * Stored RPC names
     * @type {Set}
     * @private
     */
    private _rpcNames;
    /**
     * Options hash-table
     * @type {Object}
     * @private
     */
    private _options;
    /**
     * Internal logger
     * @private
     */
    private _log;
    /**
     * Get the new unique request id
     * @returns {number}
     * @private
     */
    private _getReqId;
    /**
     * Check if input is an object literal
     * @param input
     * @returns {boolean}
     * @private
     */
    private _isPlainObject;
    /**
     * Set websocket protocol based on options
     * @private
     */
    private _setWsProtocols;
    /**
     * Fill instance operation status
     * @param {Error} err
     * @private
     */
    private _fillOpStatusByError;
    /**
     * Prerequisite checks for any wampy api call
     * @param {object} topicType { topic: URI, patternBased: true|false, allowWAMP: true|false }
     * @param {string} role
     * @returns {boolean}
     * @private
     */
    private _preReqChecks;
    /**
     * Check for specified feature in a role of connected WAMP Router
     * @param {string} role
     * @param {string} feature
     * @returns {boolean}
     * @private
     */
    private _checkRouterFeature;
    /**
     * Check for PPT mode options correctness
     * @param {string} role WAMP Router Role to check support
     * @param {object} options
     * @returns {boolean}
     * @private
     */
    private _checkPPTOptions;
    /**
     * Validate uri
     * @param {string} uri
     * @param {boolean} isPatternBased
     * @param {boolean} isWampAllowed
     * @returns {boolean}
     * @private
     */
    private _validateURI;
    /**
     * Prepares PPT/E2EE payload for adding to WAMP message
     * @param {string|number|Array|object} payload
     * @param {Object} options
     * @returns {Object}
     * @private
     */
    private _packPPTPayload;
    /**
     * Unpack PPT/E2EE payload to common
     * @param {string} role
     * @param {Array} pptPayload
     * @param {Object} options
     * @returns {Object}
     * @private
     */
    private _unpackPPTPayload;
    /**
     * Encode WAMP message
     * @param {Array} msg
     * @returns {*}
     * @private
     */
    private _encode;
    /**
     * Decode WAMP message
     * @param  msg
     * @returns {Promise}
     * @private
     */
    private _decode;
    /**
     * Hard close of connection due to protocol violations
     * @param {string} errorUri
     * @param {string} details
     * @param {boolean} [noSend]
     * @private
     */
    private _hardClose;
    /**
     * Send encoded message to server
     * @param {Array} [msg]
     * @private
     */
    private _send;
    /**
     * Reject (fail) all ongoing promises on connection closing
     * @private
     * @param {Error} error
     */
    private _reject_ongoing_promises;
    /**
     * Reset internal state and cache
     * @private
     */
    private _resetState;
    /**
     * Initialize internal websocket callbacks
     * @private
     */
    private _initWsCallbacks;
    /**
     * Internal websocket on open callback
     * @private
     */
    private _wsOnOpen;
    /**
     * Internal websocket on close callback
     * @param {object} event
     * @private
     */
    private _wsOnClose;
    /**
     * Internal websocket on event callback
     * @param {object} event
     * @private
     */
    private _wsOnMessage;
    /**
     * Validates the requestId for message types that need this kind of validation
     * @param {Array} data - [messageType, requestId]
     * @return {boolean} true if it's a valid request and false if it isn't
     * @private
     */
    private _isRequestIdValid;
    /**
     * Handles websocket welcome message event
     * WAMP SPEC: [WELCOME, Session|id, Details|dict]
     * @param {Array} [, sessionId, details] - decoded event data
     * @private
     */
    private _onWelcomeMessage;
    /**
     * Handles websocket abort message event
     * WAMP SPEC: [ABORT, Details|dict, Error|uri]
     * @param {Array} [, details, error] - decoded event data array
     * @private
     */
    private _onAbortMessage;
    /**
     * Handles websocket challenge message event
     * WAMP SPEC: [CHALLENGE, AuthMethod|string, Extra|dict]
     * @param {Array} [, authMethod, extra] - decoded event data array
     * @private
     */
    private _onChallengeMessage;
    /**
     * Handles websocket goodbye message event
     * WAMP SPEC: [GOODBYE, Details|dict, Reason|uri]
     * @private
     */
    private _onGoodbyeMessage;
    /**
     * Handles websocket error message event
     * WAMP SPEC: [ERROR, REQUEST.Type|int, REQUEST.Request|id, Details|dict,
     *             Error|uri, (Arguments|list, ArgumentsKw|dict)]
     * @param {Array} [, requestType, requestId, details, error, argsList, argsDict] - decoded event data array
     * @private
     */
    private _onErrorMessage;
    /**
     * Handles websocket subscribed message event
     * WAMP SPEC: [SUBSCRIBED, SUBSCRIBE.Request|id, Subscription|id]
     * @param {Array} [, requestId, subscriptionId] - decoded event data Array, with the
     * second and third elements of the Array being the requestId and subscriptionId respectively
     * @private
     */
    private _onSubscribedMessage;
    /**
     * Handles websocket unsubscribed message event
     * WAMP SPEC: [UNSUBSCRIBED, UNSUBSCRIBE.Request|id]
     * @param {Array} [, requestId] - decoded event data Array, with the
     * second element of the Array being the requestId
     * @private
     */
    private _onUnsubscribedMessage;
    /**
     * Handles websocket published message event
     * WAMP SPEC: [PUBLISHED, PUBLISH.Request|id, Publication|id]
     * @param {Array} [, requestId, publicationId] - decoded event data
     * @private
     */
    private _onPublishedMessage;
    /**
     * Handles websocket event message event
     * WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id,
     *            Details|dict, PUBLISH.Arguments|list, PUBLISH.ArgumentKw|dict]
     * @param {Array} [, subscriptionId, publicationId, details, argsList, argsDict] - decoded event data
     * @private
     */
    private _onEventMessage;
    /**
     * Handles websocket result message event
     * WAMP SPEC: [RESULT, CALL.Request|id, Details|dict,
     *             YIELD.Arguments|list, YIELD.ArgumentsKw|dict]
     * @param {object} data - decoded event data
     * @private
     */
    private _onResultMessage;
    /**
     * Handles websocket registered message event
     * WAMP SPEC: [REGISTERED, REGISTER.Request|id, Registration|id]
     * @param {Array} [, requestId, registrationId] - decoded event data array
     * @private
     */
    private _onRegisteredMessage;
    /**
     * Handles websocket unregistered message event
     * WAMP SPEC: [UNREGISTERED, UNREGISTER.Request|id]
     * @param {Array} [, requestId] - decoded event data array
     * @private
     */
    private _onUnregisteredMessage;
    /**
     * Handles websocket invocation message event
     * WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id, Details|dict,
     *             CALL.Arguments|list, CALL.ArgumentsKw|dict]
     * @param {Array} data - decoded event data array
     * @private
     */
    private _onInvocationMessage;
    /**
     * Internal websocket on error callback
     * @param {object} error
     * @private
     */
    private _wsOnError;
    /**
     * Reconnect to server in case of websocket error
     * @private
     */
    private _wsReconnect;
    /**
     * Resubscribe to topics in case of communication error
     * @private
     */
    private _renewSubscriptions;
    /**
     * ReRegister RPCs in case of communication error
     * @private
     */
    private _renewRegistrations;
    /**
     * Generate a unique key for combination of topic and options
     *
     * This is needed to allow subscriptions to the same topic URI but with different options
     *
     * @param {string} topic
     * @param {object} options
     * @private
     */
    private _getSubscriptionKey;
    /*************************************************************************
     * Wampy public API
     *************************************************************************/
    /**
     * @deprecated since version 7.0.1
     *
     * Get or set Wampy options
     *
     * To get options - call without parameters
     * To set options - pass hash-table with options values
     *
     * @param {object} [newOptions]
     * @returns {*}
     */
    options(newOptions?: object): any;
    /**
     * Wampy options getter
     *
     * @returns {object}
     */
    getOptions(): object;
    /**
     * Wampy options setter
     *
     * @param {object} newOptions
     * @returns {*}
     */
    setOptions(newOptions: object): any;
    /**
     * Get the status of last operation
     *
     * @returns {object} with 3 fields: code, error, reqId
     *      code: 0 - if operation was successful
     *      code > 0 - if error occurred
     *      error: error instance containing details
     *      reqId: last successfully sent request ID
     */
    getOpStatus(): object;
    /**
     * Get the WAMP Session ID
     *
     * @returns {string} Session ID
     */
    getSessionId(): string;
    /**
     * Connect to server
     * @param {string} [url] New url (optional)
     * @returns {Promise}
     */
    connect(url?: string): Promise<any>;
    /**
     * Disconnect from server
     * @returns {Promise}
     */
    disconnect(): Promise<any>;
    /**
     * Abort WAMP session establishment
     *
     * @returns {Wampy}
     */
    abort(): Wampy;
    /**
     * Subscribe to a topic on a broker
     *
     * @param {string} topic - a URI to subscribe to
     * @param {function} onEvent - received event callback
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          {
     *                              match: string matching policy ("exact"|"prefix"|"wildcard")
     *                              get_retained: bool request access to the Retained Event
     *                          }
     *
     * @returns {Promise}
     */
    subscribe(topic: string, onEvent: Function, advancedOptions?: object): Promise<any>;
    /**
     * Unsubscribe from topic
     * @param {string|number} subscriptionIdOrKey Subscription ID or Key, received during .subscribe()
     * @param {function} [onEvent] - received event callback to remove (optional). If not provided -
     *                               all callbacks will be removed and unsubscribed on the server
     * @returns {Promise}
     */
    unsubscribe(subscriptionIdOrKey: string | number, onEvent?: Function): Promise<any>;
    /**
     * Publish an event to the topic
     * @param {string} topic
     * @param {string|number|Array|object} [payload] - can be either a value of any type or null or even omitted.
     *                          Also, it is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (may be omitted)
     *                             argsDict: object payload (may be omitted)
     *                          }
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { exclude: integer|array WAMP session id(s) that won't receive a published event,
     *                                      even though they may be subscribed
     *                            exclude_authid: string|array Authentication id(s) that won't receive
     *                                      a published event, even though they may be subscribed
     *                            exclude_authrole: string|array Authentication role(s) that won't receive
     *                                      a published event, even though they may be subscribed
     *                            eligible: integer|array WAMP session id(s) that are allowed
     *                                      to receive a published event
     *                            eligible_authid: string|array Authentication id(s) that are allowed
     *                                      to receive a published event
     *                            eligible_authrole: string|array Authentication role(s) that are allowed
     *                                      to receive a published event
     *                            exclude_me: bool flag of receiving publishing event by initiator
     *                            disclose_me: bool flag of disclosure of publisher identity (its WAMP session ID)
     *                                      to receivers of a published event
     *                            ppt_scheme: string Identifies the Payload Schema
     *                            ppt_serializer: string Specifies what serializer was used to encode the payload
     *                            ppt_cipher: string Specifies the cryptographic algorithm that was used to encrypt
     *                                      the payload
     *                            ppt_keyid: string Contains the encryption key id that was used to encrypt the payload
     *                            retain: bool Ask broker to mark this event as retained
     *                                    (see Event Retention WAMP Feature)
     *                          }
     * @returns {Promise}
     */
    publish(topic: string, payload?: string | number | any[] | object, advancedOptions?: object): Promise<any>;
    /**
     * Extract custom options from advanced options as per WAMP spec 3.1
     *
     * @param {object} advancedOptions
     * @private
     * @returns {object}
     */
    private _extractCustomOptions;
    /**
     * Process CALL advanced options and transform them for the WAMP CALL message Options
     *
     * @param {object} advancedOptions
     * @private
     * @returns {object}
     */
    private _getCallMessageOptionsFromAdvancedOptions;
    /**
     * Remote Procedure Call Internal Implementation
     * @param {string} topic - same as in call method
     * @param {string|number|Array|object} [payload] - same as in call method
     * @param {object} [advancedOptions] - same as in call method
     * @returns {number} Request ID
     */
    _callInternal(topic: string, payload?: string | number | any[] | object, advancedOptions?: object): number;
    /**
     * Remote Procedure Call
     * @param {string} topic - a topic URI to be called
     * @param {string|number|Array|object} [payload] - can be either a value of any type or null. Also, it
     *                          is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (may be omitted)
     *                             argsDict: object payload (may be omitted)
     *                          }
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { disclose_me:      bool flag of disclosure of Caller identity (WAMP session ID)
     *                                              to endpoints of a routed call
     *                            progress_callback: function for handling progressive call results
     *                            timeout:          integer timeout (in ms) for the call to finish
     *                            ppt_scheme: string Identifies the Payload Schema
     *                            ppt_serializer: string Specifies what serializer was used to encode the payload
     *                            ppt_cipher: string Specifies the cryptographic algorithm that was used to encrypt
     *                                the payload
     *                            ppt_keyid: string Contains the encryption key id that was used to encrypt the payload
     *                          }
     * @returns {Promise}
     */
    call(topic: string, payload?: string | number | any[] | object, advancedOptions?: object): Promise<any>;
    /**
     * @typedef {function} ProgressiveCallSendData
     * @param {string|number|Array|object} [payload] - can be either a value of any type or null. Also, it
     *                           is possible to pass array and object-like data simultaneously.
     *                           In this case pass a hash-table with next attributes:
     *                           {
     *                              argsList: array payload (maybe omitted)
     *                              argsDict: object payload (maybe omitted)
     *                           }
     * @param {object} [advancedOptions] - optional parameter - Must include next options:
     *                           {
     *                              progress: bool flag, indicating the ongoing (true) or final (false) call invocation.
     *                                        If this parameter is omitted - it is treated as TRUE, meaning the
     *                                        intermediate ongoing call invocation. For the final call invocation
     *                                        this flag must be passed and set to FALSE. In other case the call
     *                                        invocation wil never end.
     *                           }
     */
    /**
     * @typedef {Object} ProgressiveCallReturn
     * @property {Promise} result - A promise that resolves to the result of the RPC call.
     * @property {ProgressiveCallSendData} sendData - A function to send additional data to the ongoing RPC call.
     */
    /**
     * Remote Procedure Progressive Call
     *
     * You can send additional input data which won't be treated as a new independent but instead
     * will be transferred as another input data chunk to the same remote procedure call. Of course
     * Callee and Dealer should support the "progressive_call_invocations" feature as well.
     *
     * @param {string} topic - a topic URI to be called
     * @param {string|number|Array|object} [payload] - can be either a value of any type or null. Also, it
     *                          is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (maybe omitted)
     *                             argsDict: object payload (maybe omitted)
     *                          }
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { disclose_me:      bool flag of disclosure of Caller identity (WAMP session ID)
     *                                              to endpoints of a routed call
     *                            progress_callback: function for handling progressive call results
     *                            timeout:          integer timeout (in ms) for the call to finish
     *                            ppt_scheme: string Identifies the Payload Schema
     *                            ppt_serializer: string Specifies what serializer was used to encode the payload
     *                            ppt_cipher: string Specifies the cryptographic algorithm that was used to encrypt
     *                                the payload
     *                            ppt_keyid: string Contains the encryption key id that was used to encrypt the payload
     *                          }
     * @returns {ProgressiveCallReturn} - An object containing the result promise and the sendData function.
     */
    progressiveCall(topic: string, payload?: string | number | any[] | object, advancedOptions?: object): {
        /**
         * - A promise that resolves to the result of the RPC call.
         */
        result: Promise<any>;
        /**
         * - A function to send additional data to the ongoing RPC call.
         */
        sendData: Function;
    };
    /**
     * RPC invocation cancelling
     *
     * @param {int} reqId RPC call request ID
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { mode: string|one of the possible modes:
     *                                  "skip" | "kill" | "killnowait". Skip is default.
     *                          }
     *
     * @returns {Boolean}
     */
    cancel(reqId: int, advancedOptions?: object): boolean;
    /**
     * RPC registration for invocation
     * @param {string} topic
     * @param {function} rpc - rpc that will receive invocations
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          {
     *                              match: string matching policy ("exact"|"prefix"|"wildcard")
     *                              invoke: string invocation policy ("single"|"roundrobin"|"random"|"first"|"last")
     *                          }
     * @returns {Promise}
     */
    register(topic: string, rpc: Function, advancedOptions?: object): Promise<any>;
    /**
     * RPC unregistration for invocation
     * @param {string} topic - a topic URI to unregister
     * @returns {Promise}
     */
    unregister(topic: string): Promise<any>;
}
