import * as moment from 'moment';
export interface ITimestamped {
  time: Date;
}
export declare class Timestamped<T> implements ITimestamped {
  data: T;
  time: Date;
  constructor(data: T, time: Date);
  toString(): string;
}
export declare class MarketSide {
  price: number;
  size: number;
  constructor(price: number, size: number);
  toString(): string;
}
export declare class GatewayMarketTrade implements ITimestamped {
  price: number;
  size: number;
  time: Date;
  onStartup: boolean;
  make_side: Side;
  constructor(
    price: number,
    size: number,
    time: Date,
    onStartup: boolean,
    make_side: Side
  );
}
export declare function marketSideEquals(
  t: MarketSide,
  other: MarketSide,
  tol?: number
): boolean;
export declare class Market implements ITimestamped {
  bids: MarketSide[];
  asks: MarketSide[];
  time: Date;
  constructor(bids: MarketSide[], asks: MarketSide[], time: Date);
  toString(): string;
}
export declare class MarketTrade implements ITimestamped {
  exchange: Exchange;
  pair: CurrencyPair;
  price: number;
  size: number;
  time: Date;
  quote: TwoSidedQuote;
  bid: MarketSide;
  ask: MarketSide;
  make_side: Side;
  constructor(
    exchange: Exchange,
    pair: CurrencyPair,
    price: number,
    size: number,
    time: Date,
    quote: TwoSidedQuote,
    bid: MarketSide,
    ask: MarketSide,
    make_side: Side
  );
}
export declare enum Currency {
  ADB = 0,
  ETH = 1,
  BTC = 2
}
export declare function toCurrency(c: string): Currency | undefined;
export declare function fromCurrency(c: Currency): string | undefined;
export declare enum GatewayType {
  MarketData = 0,
  OrderEntry = 1,
  Position = 2
}
export declare enum ConnectivityStatus {
  Connected = 0,
  Disconnected = 1
}
export declare enum Exchange {
  Null = 0,
  HitBtc = 1,
  OkCoin = 2,
  AtlasAts = 3,
  BtcChina = 4,
  Coinbase = 5,
  Bitfinex = 6,
  Kucoin = 7
}
export declare enum Side {
  Bid = 0,
  Ask = 1,
  Unknown = 2
}
export declare enum OrderType {
  Limit = 0,
  Market = 1
}
export declare enum TimeInForce {
  IOC = 0,
  FOK = 1,
  GTC = 2
}
export declare enum OrderStatus {
  New = 0,
  Working = 1,
  Complete = 2,
  Cancelled = 3,
  Rejected = 4,
  Other = 5
}
export declare enum Liquidity {
  Make = 0,
  Take = 1
}
export declare const orderIsDone: (status: OrderStatus) => boolean;
export declare enum MarketDataFlag {
  Unknown = 0,
  NoChange = 1,
  First = 2,
  PriceChanged = 4,
  SizeChanged = 8,
  PriceAndSizeChanged = 16
}
export declare enum OrderSource {
  Unknown = 0,
  Quote = 1,
  OrderTicket = 2
}
export declare class SubmitNewOrder {
  side: Side;
  quantity: number;
  type: OrderType;
  price: number;
  timeInForce: TimeInForce;
  exchange: Exchange;
  generatedTime: Date;
  preferPostOnly: boolean;
  source: OrderSource;
  msg: string;
  constructor(
    side: Side,
    quantity: number,
    type: OrderType,
    price: number,
    timeInForce: TimeInForce,
    exchange: Exchange,
    generatedTime: Date,
    preferPostOnly: boolean,
    source: OrderSource,
    msg?: string
  );
}
export declare class CancelReplaceOrder {
  origOrderId: string;
  quantity: number;
  price: number;
  exchange: Exchange;
  generatedTime: Date;
  constructor(
    origOrderId: string,
    quantity: number,
    price: number,
    exchange: Exchange,
    generatedTime: Date
  );
}
export declare class OrderCancel {
  origOrderId: string;
  exchange: Exchange;
  generatedTime: Date;
  constructor(origOrderId: string, exchange: Exchange, generatedTime: Date);
}
export declare class SentOrder {
  sentOrderClientId: string;
  constructor(sentOrderClientId: string);
}
export interface OrderStatusReport {
  pair: CurrencyPair;
  side: Side;
  quantity: number;
  type: OrderType;
  price: number;
  timeInForce: TimeInForce;
  orderId: string;
  exchangeId: string;
  orderStatus: OrderStatus;
  rejectMessage: string;
  time: Date;
  lastQuantity: number;
  lastPrice: number;
  leavesQuantity: number;
  cumQuantity: number;
  averagePrice: number;
  liquidity: Liquidity;
  exchange: Exchange;
  computationalLatency: number;
  version: number;
  preferPostOnly: boolean;
  source: OrderSource;
  partiallyFilled: boolean;
  pendingCancel: boolean;
  pendingReplace: boolean;
  cancelRejected: boolean;
}
export interface OrderStatusUpdate extends Partial<OrderStatusReport> {}
export declare class Trade implements ITimestamped {
  tradeId: string;
  time: Date;
  exchange: Exchange;
  pair: CurrencyPair;
  price: number;
  quantity: number;
  side: Side;
  value: number;
  liquidity: Liquidity;
  feeCharged: number;
  constructor(
    tradeId: string,
    time: Date,
    exchange: Exchange,
    pair: CurrencyPair,
    price: number,
    quantity: number,
    side: Side,
    value: number,
    liquidity: Liquidity,
    feeCharged: number
  );
}
export declare class CurrencyPosition {
  amount: number;
  heldAmount: number;
  currency: Currency;
  constructor(amount: number, heldAmount: number, currency: Currency);
  toString(): string;
}
export declare class PositionReport {
  baseAmount: number;
  quoteAmount: number;
  baseHeldAmount: number;
  quoteHeldAmount: number;
  value: number;
  quoteValue: number;
  pair: CurrencyPair;
  exchange: Exchange;
  time: Date;
  constructor(
    baseAmount: number,
    quoteAmount: number,
    baseHeldAmount: number,
    quoteHeldAmount: number,
    value: number,
    quoteValue: number,
    pair: CurrencyPair,
    exchange: Exchange,
    time: Date
  );
}
export declare class OrderRequestFromUI {
  side: string;
  price: number;
  quantity: number;
  timeInForce: string;
  orderType: string;
  constructor(
    side: string,
    price: number,
    quantity: number,
    timeInForce: string,
    orderType: string
  );
}
export interface ReplaceRequestFromUI {
  price: number;
  quantity: number;
}
export declare class FairValue implements ITimestamped {
  price: number;
  time: Date;
  constructor(price: number, time: Date);
}
export declare enum QuoteAction {
  New = 0,
  Cancel = 1
}
export declare enum QuoteSent {
  First = 0,
  Modify = 1,
  UnsentDuplicate = 2,
  Delete = 3,
  UnsentDelete = 4,
  UnableToSend = 5
}
export declare class Quote {
  price: number;
  size: number;
  constructor(price: number, size: number);
}
export declare class TwoSidedQuote implements ITimestamped {
  bid: Quote;
  ask: Quote;
  time: Date;
  constructor(bid: Quote, ask: Quote, time: Date);
}
export declare enum QuoteStatus {
  Live = 0,
  Held = 1
}
export declare class SerializedQuotesActive {
  active: boolean;
  time: Date;
  constructor(active: boolean, time: Date);
}
export declare class TwoSidedQuoteStatus {
  bidStatus: QuoteStatus;
  askStatus: QuoteStatus;
  constructor(bidStatus: QuoteStatus, askStatus: QuoteStatus);
}
export declare class CurrencyPair {
  base: Currency;
  quote: Currency;
  constructor(base: Currency, quote: Currency);
  toString(): string;
}
export declare function currencyPairEqual(
  a: CurrencyPair,
  b: CurrencyPair
): boolean;
export declare enum QuotingMode {
  Top = 0,
  Mid = 1,
  Join = 2,
  InverseJoin = 3,
  InverseTop = 4,
  PingPong = 5,
  Depth = 6
}
export declare enum FairValueModel {
  BBO = 0,
  wBBO = 1
}
export declare enum AutoPositionMode {
  Off = 0,
  EwmaBasic = 1
}
export declare class QuotingParameters {
  width: number;
  size: number;
  mode: QuotingMode;
  fvModel: FairValueModel;
  targetBasePosition: number;
  positionDivergence: number;
  ewmaProtection: boolean;
  autoPositionMode: AutoPositionMode;
  aggressivePositionRebalancing: boolean;
  tradesPerMinute: number;
  tradeRateSeconds: number;
  longEwma: number;
  shortEwma: number;
  quotingEwma: number;
  aprMultiplier: number;
  stepOverSize: number;
  constructor(
    width: number,
    size: number,
    mode: QuotingMode,
    fvModel: FairValueModel,
    targetBasePosition: number,
    positionDivergence: number,
    ewmaProtection: boolean,
    autoPositionMode: AutoPositionMode,
    aggressivePositionRebalancing: boolean,
    tradesPerMinute: number,
    tradeRateSeconds: number,
    longEwma: number,
    shortEwma: number,
    quotingEwma: number,
    aprMultiplier: number,
    stepOverSize: number
  );
}
export declare function toUtcFormattedTime(t: moment.Moment | Date): string;
export declare function veryShortDate(t: moment.Moment | Date): string;
export declare function toShortTimeString(t: moment.Moment | Date): string;
export declare class ExchangePairMessage<T> {
  exchange: Exchange;
  pair: CurrencyPair;
  data: T;
  constructor(exchange: Exchange, pair: CurrencyPair, data: T);
}
export declare class ProductAdvertisement {
  exchange: Exchange;
  pair: CurrencyPair;
  environment: string;
  minTick: number;
  constructor(
    exchange: Exchange,
    pair: CurrencyPair,
    environment: string,
    minTick: number
  );
}
export declare class Message implements ITimestamped {
  text: string;
  time: Date;
  constructor(text: string, time: Date);
}
export declare class RegularFairValue {
  time: Date;
  value: number;
  constructor(time: Date, value: number);
}
export declare class TradeSafety {
  buy: number;
  sell: number;
  combined: number;
  buyPing: number;
  sellPong: number;
  time: Date;
  constructor(
    buy: number,
    sell: number,
    combined: number,
    buyPing: number,
    sellPong: number,
    time: Date
  );
}
export declare class TargetBasePositionValue {
  data: number;
  time: Date;
  constructor(data: number, time: Date);
}
export declare class CancelAllOrdersRequest {
  constructor();
}
