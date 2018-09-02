import TelegramAnnouncer from "../TelegramAnnouncer";
import XMLRPCAnnouncer from "../XMLRPCAnnouncer";

export default interface IEnabledAnnouncers {
    telegram: TelegramAnnouncer | false,
    xmlrpc: XMLRPCAnnouncer | false
}