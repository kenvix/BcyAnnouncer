import telegramAnnouncer from "../telegramAnnouncer";
import xmlrpcAnnouncer from "../xmlrpcAnnouncer";

export default interface IEnabledAnnouncers {
    telegram: telegramAnnouncer | false,
    xmlrpc: xmlrpcAnnouncer | false
}