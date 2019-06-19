import { GraphQLServer } from 'graphql-yoga'

const { IceteaWeb3 } = require('@iceteachain/web3')
const tweb3 = new IceteaWeb3('wss://rpc.icetea.io/websocket')

const typeDefs = `
    type Query {
        Blocks(query: Int): [Block]
    },

    type Block {
        block_id: Block_id
        header: Header
    }

    type Block_id {
        hash: String,
        parts: blockIDParts
    }

    type Header {
        version: Version
        chain_id: String,
        height: Int,
        time: String,
        num_txs: Int,
        total_txs: Int,
        last_block_id: Last_block_id
        last_commit_hash: String,
        data_hash: String,
        validators_hash: String,
        next_validators_hash: String,
        consensus_hash: String,
        app_hash: String,
        last_results_hash: String,
        evidence_hash: String,
        proposer_address: String
    }

    type blockIDParts {
        total: Int,
        hash: String
    }

    type Version {
        block: Float
        app: Float
    }

    type Last_block_id {
        hash: String,
        parts: lastBlockParts
    }

    type lastBlockParts {
        total: Int,
        hash: String
    }
`

const resolvers = {
    Query: {
        Blocks(parent, args, ctx, info) {
            return tweb3.getBlocks()
                .then((res) => {
                    const blocks = res.block_metas
                    if (!args.query) return blocks

                    return blocks.filter((block) => {
                        return block.header.height == args.query
                    })
                })
        }
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(() => {
    console.log('The server is up!')
})