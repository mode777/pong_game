export default Wampy;

/**
 * Generic dictionary type
 */
export type Dict = { [key: string]: any };

/**
 * Generic callback function
 */
export type Callback = () => void;

/**
 * Error callback function
 */
export type ErrorCallback = (args: ErrorArgs) => void;

/**
 * Event callback function
 */
export type EventCallback = (args: DataArgs) => void;

/**
 * Success callback function
 */
export type SuccessCallback = (args: DataArgs) => void;

/**
 * RPC callback function
 */
export type RPCCallback = (args: DataArgs) => RPCResult | void;

/**
 * Challenge callback function for authentication
 */
export type ChallengeCallback = (auth_method: string, extra: Dict) => string;

/**
 * Payload type - can be various data types
 */
export type Payload = Args | Dict | string | number | boolean | any[] | null;

/**
 * Arguments structure with list and dictionary
 */
export interface Args {
    argsList: any[];
    argsDict: Dict;
}

/**
 * Error arguments structure
 */
export interface ErrorArgs {
    error: string;
    details: Dict;
}

/**
 * Data arguments structure
 */
export interface DataArgs extends Args {
    details: Dict;
}

/**
 * RPC options
 */
export interface RPCOptions {
    process?: boolean;
}

/**
 * RPC result structure
 */
export interface RPCResult extends Args {
    options: RPCOptions;
}

/**
 * Subscribe callbacks hash
 */
export interface SubscribeCallbacksHash {
    onSuccess?: Callback;
    onError?: ErrorCallback;
    onEvent?: EventCallback;
}

/**
 * Unsubscribe callbacks hash
 */
export interface UnsubscibeCallbacksHash extends SubscribeCallbacksHash {
}

/**
 * Publish callbacks hash
 */
export interface PublishCallbacksHash {
    onSuccess?: Callback;
    onError?: ErrorCallback;
}

/**
 * Call callbacks hash
 */
export interface CallCallbacksHash {
    onSuccess?: SuccessCallback;
    onError?: ErrorCallback;
}

/**
 * Cancel callbacks hash
 */
export interface CancelCallbacksHash {
    onSuccess?: Callback;
    onError?: Callback;
}

/**
 * Register callbacks hash
 */
export interface RegisterCallbacksHash {
    rpc: RPCCallback;
    onSuccess?: Callback;
    onError?: ErrorCallback;
}

/**
 * Unregister callbacks hash
 */
export interface UnregisterCallbacksHash {
    onSuccess?: Callback;
    onError?: ErrorCallback;
}

/**
 * Subscribe advanced options
 */
export interface SubscribeAdvancedOptions {
    match?: "prefix" | "wildcard";
    get_retained?: boolean;
}

/**
 * Advanced options for publish and other operations
 */
export interface AdvancedOptions {
    exclude?: number | number[];
    eligible?: number | number[];
    exclude_me?: boolean;
    disclose_me?: boolean;
}

/**
 * Publish advanced options
 */
export interface PublishAdvancedOptions extends AdvancedOptions {
    exclude_authid?: string | string[];
    exclude_authrole?: string | string[];
    eligible_authid?: string | string[];
    eligible_authrole?: string | string[];
    ppt_scheme?: string;
    ppt_serializer?: string;
    ppt_cipher?: string;
    ppt_keyid?: string;
    retain?: boolean;
}

/**
 * Call advanced options
 */
export interface CallAdvancedOptions {
    disclose_me?: boolean;
    receive_progress?: boolean;
    progress_callback?: (args: DataArgs) => void;
    timeout?: number;
    ppt_scheme?: string;
    ppt_serializer?: string;
    ppt_cipher?: string;
    ppt_keyid?: string;
}

/**
 * Cancel advanced options
 */
export interface CancelAdvancedOptions {
    mode?: "skip" | "kill" | "killnowait";
}

/**
 * Register advanced options
 */
export interface RegisterAdvancedOptions {
    match?: "prefix" | "wildcard";
    invoke?: "single" | "roundrobin" | "random" | "first" | "last";
}

/**
 * Wampy configuration options
 */
export interface WampyOptions {
    autoReconnect?: boolean;
    reconnectInterval?: number;
    maxRetries?: number;
    realm?: string;
    helloCustomDetails?: any;
    authid?: string;
    authmethods?: string[];
    onChallenge?: ChallengeCallback;
    onConnect?: Callback;
    onClose?: Callback;
    onError?: Callback;
    onReconnect?: Callback;
    onReconnectSuccess?: Callback;
    ws?: any;
    serializer?: any;
    uriValidation?: "strict" | "loose";
}

/**
 * Wampy operation status
 */
export interface WampyOpStatus {
    code: number;
    description: string;
    reqId?: number;
}

/**
 * WAMP Client Class
 */
export class Wampy {
    /**
     * Wampy constructor
     * @param {string} [url]
     * @param {WampyOptions} [options]
     */
    constructor(url?: string, options?: WampyOptions);
    
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
     * @param {WampyOptions} [newOptions]
     * @returns {WampyOptions | Wampy}
     */
    options(newOptions?: WampyOptions): WampyOptions | Wampy;
    /**
     * Wampy options getter
     *
     * @returns {WampyOptions}
     */
    getOptions(): WampyOptions;
    /**
     * Wampy options setter
     *
     * @param {WampyOptions} newOptions
     * @returns {Wampy}
     */
    setOptions(newOptions: WampyOptions): Wampy;
    /**
     * Get the status of last operation
     *
     * @returns {WampyOpStatus} with 3 fields: code, error, reqId
     *      code: 0 - if operation was successful
     *      code > 0 - if error occurred
     *      error: error instance containing details
     *      reqId: last successfully sent request ID
     */
    getOpStatus(): WampyOpStatus;
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
     * @param {EventCallback | SubscribeCallbacksHash} onEvent - received event callback
     * @param {SubscribeAdvancedOptions} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          {
     *                              match: string matching policy ("exact"|"prefix"|"wildcard")
     *                              get_retained: bool request access to the Retained Event
     *                          }
     *
     * @returns {Promise}
     */
    subscribe(topic: string, onEvent: EventCallback | SubscribeCallbacksHash, advancedOptions?: SubscribeAdvancedOptions): Promise<any>;
    /**
     * Unsubscribe from topic
     * @param {string|number} subscriptionIdOrKey Subscription ID or Key, received during .subscribe()
     * @param {EventCallback | UnsubscibeCallbacksHash} [onEvent] - received event callback to remove (optional). If not provided -
     *                               all callbacks will be removed and unsubscribed on the server
     * @returns {Promise}
     */
    unsubscribe(subscriptionIdOrKey: string | number, onEvent?: EventCallback | UnsubscibeCallbacksHash): Promise<any>;
    /**
     * Publish an event to the topic
     * @param {string} topic
     * @param {Payload} [payload] - can be either a value of any type or null or even omitted.
     *                          Also, it is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (may be omitted)
     *                             argsDict: object payload (may be omitted)
     *                          }
     * @param {PublishCallbacksHash | PublishAdvancedOptions} [advancedOptions] - optional parameter. Must include any or all of the options:
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
    publish(topic: string, payload?: Payload, advancedOptions?: PublishCallbacksHash | PublishAdvancedOptions): Promise<any>;
    /**
     * Remote Procedure Call
     * @param {string} topic - a topic URI to be called
     * @param {Payload} [payload] - can be either a value of any type or null. Also, it
     *                          is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (may be omitted)
     *                             argsDict: object payload (may be omitted)
     *                          }
     * @param {SuccessCallback | CallCallbacksHash | CallAdvancedOptions} [advancedOptions] - optional parameter. Must include any or all of the options:
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
    call(topic: string, payload?: Payload, advancedOptions?: SuccessCallback | CallCallbacksHash | CallAdvancedOptions): Promise<RPCResult>;
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
     * @param {Payload} [payload] - can be either a value of any type or null. Also, it
     *                          is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (maybe omitted)
     *                             argsDict: object payload (maybe omitted)
     *                          }
     * @param {CallAdvancedOptions} [advancedOptions] - optional parameter. Must include any or all of the options:
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
    progressiveCall(topic: string, payload?: Payload, advancedOptions?: CallAdvancedOptions): {
        /**
         * - A promise that resolves to the result of the RPC call.
         */
        result: Promise<any>;
        /**
         * - A function to send additional data to the ongoing RPC call.
         */
        sendData: (payload?: Payload, advancedOptions?: { progress?: boolean }) => void;
    };
    /**
     * RPC invocation cancelling
     *
     * @param {number} reqId RPC call request ID
     * @param {Callback | CancelCallbacksHash | CancelAdvancedOptions} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { mode: string|one of the possible modes:
     *                                  "skip" | "kill" | "killnowait". Skip is default.
     *                          }
     *
     * @returns {Wampy}
     */
    cancel(reqId: number, advancedOptions?: Callback | CancelCallbacksHash | CancelAdvancedOptions): Wampy;
    /**
     * RPC registration for invocation
     * @param {string} topic
     * @param {RPCCallback | RegisterCallbacksHash} rpc - rpc that will receive invocations
     * @param {RegisterAdvancedOptions} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          {
     *                              match: string matching policy ("exact"|"prefix"|"wildcard")
     *                              invoke: string invocation policy ("single"|"roundrobin"|"random"|"first"|"last")
     *                          }
     * @returns {Promise}
     */
    register(topic: string, rpc: RPCCallback | RegisterCallbacksHash | boolean | number | void | undefined | null | any[] | Dict, advancedOptions?: RegisterAdvancedOptions): Promise<any>;
    /**
     * RPC unregistration for invocation
     * @param {string} topic - a topic URI to unregister
     * @param {Callback | UnregisterCallbacksHash} [callbacks] - optional callbacks
     * @returns {Promise}
     */
    unregister(topic: string, callbacks?: Callback | UnregisterCallbacksHash): Promise<any>;
}
