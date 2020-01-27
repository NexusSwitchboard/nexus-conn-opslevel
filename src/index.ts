import {GraphQLClient} from "graphql-request";
import {Connection, ConnectionConfig, getNestedVal} from "@nexus-switchboard/nexus-extend";

type OpsLevelService = Record<string, any>;

export interface IOpsLevelConfig {
    apiToken: string;
    graphQlEndpoint: string;
}

export class OpsLevelConnection extends Connection {
    public api: GraphQLClient;

    public name = "OpsLevel";
    public config: IOpsLevelConfig;

    /**
     * This connect will attempt to pull the account information via API request which
     * means that the account name associated with this instance may not be available
     * immediately.
     */
    public connect(): OpsLevelConnection {
        this.api = new GraphQLClient(this.config.graphQlEndpoint, {
            headers: {
                Authorization: "Bearer " + this.config.apiToken
            }
        });
        return this;
    }

    public async getServices(): Promise<OpsLevelService[]> {
        const MAX = 100;
        let cont = true;
        let endCursor = null;
        let allServices: OpsLevelService[] = [];
        while (cont) {
            const result: any = await this.api.request(`
                {
                    query:
                        account {
                            services(first:${MAX}, after:"${endCursor}"){
                                nodes {
                                    id,
                                    alias,
                                    name,
                                    description,
                                    product,
                                    owner {
                                    id,
                                    name
                                    }
                                }
                                pageInfo {
                                    endCursor
                                    hasNextPage
                                }
                            }
                        }
                }
            `);
            const servicesPartial = getNestedVal(result, "query.services.nodes") as OpsLevelService[];
            allServices = allServices.concat(servicesPartial);
            cont = getNestedVal(result, "query.services.pageInfo.hasNextPage");
            if (cont) {
                endCursor = getNestedVal(result, "query.services.pageInfo.endCursor");
            }
        }

        return allServices;
    }

    public disconnect(): boolean {
        delete this.api;
        return true;
    }
}

export default function createConnection(cfg: ConnectionConfig): Connection {
    return new OpsLevelConnection(cfg);
}
