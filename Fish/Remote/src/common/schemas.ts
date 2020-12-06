/*
File containing schemas for the JSON messages that get sent between
the client and servers
*/

const messageSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    additionalItems: {
        anyOf: [
            {
                type: "string",
            },
            {
                items: {},
                type: "array",
            },
        ],
    },
    items: [
        {
            type: "string",
        },
        {
            items: {},
            type: "array",
        },
    ],
    minItems: 2,
    type: "array",
}

const startMessageSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    allOf: [
        {
            additionalItems: {
                anyOf: [
                    {
                        type: "string",
                    },
                    {
                        items: {},
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    type: "string",
                },
                {
                    items: {},
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
        {
            additionalItems: {
                anyOf: [
                    {
                        enum: ["start"],
                        type: "string",
                    },
                    {
                        additionalItems: {
                            anyOf: [
                                {
                                    type: "boolean",
                                },
                            ],
                        },
                        items: [
                            {
                                type: "boolean",
                            },
                        ],
                        minItems: 1,
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    enum: ["start"],
                    type: "string",
                },
                {
                    additionalItems: {
                        anyOf: [
                            {
                                type: "boolean",
                            },
                        ],
                    },
                    items: [
                        {
                            type: "boolean",
                        },
                    ],
                    minItems: 1,
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
    ],
}

const playingAsMessageSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    allOf: [
        {
            additionalItems: {
                anyOf: [
                    {
                        type: "string",
                    },
                    {
                        items: {},
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    type: "string",
                },
                {
                    items: {},
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
        {
            additionalItems: {
                anyOf: [
                    {
                        enum: ["playing-as"],
                        type: "string",
                    },
                    {
                        additionalItems: {
                            anyOf: [
                                {
                                    enum: ["black", "brown", "red", "white"],
                                    type: "string",
                                },
                            ],
                        },
                        items: [
                            {
                                enum: ["black", "brown", "red", "white"],
                                type: "string",
                            },
                        ],
                        minItems: 1,
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    enum: ["playing-as"],
                    type: "string",
                },
                {
                    additionalItems: {
                        anyOf: [
                            {
                                enum: ["black", "brown", "red", "white"],
                                type: "string",
                            },
                        ],
                    },
                    items: [
                        {
                            enum: ["black", "brown", "red", "white"],
                            type: "string",
                        },
                    ],
                    minItems: 1,
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
    ],
}

const playingWithMessageSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    allOf: [
        {
            additionalItems: {
                anyOf: [
                    {
                        type: "string",
                    },
                    {
                        items: {},
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    type: "string",
                },
                {
                    items: {},
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
        {
            additionalItems: {
                anyOf: [
                    {
                        enum: ["playing-with"],
                        type: "string",
                    },
                    {
                        additionalItems: {
                            anyOf: [
                                {
                                    items: {
                                        enum: [
                                            "black",
                                            "brown",
                                            "red",
                                            "white",
                                        ],
                                        type: "string",
                                    },
                                    type: "array",
                                },
                            ],
                        },
                        items: [
                            {
                                items: {
                                    enum: ["black", "brown", "red", "white"],
                                    type: "string",
                                },
                                type: "array",
                            },
                        ],
                        minItems: 1,
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    enum: ["playing-with"],
                    type: "string",
                },
                {
                    additionalItems: {
                        anyOf: [
                            {
                                items: {
                                    enum: ["black", "brown", "red", "white"],
                                    type: "string",
                                },
                                type: "array",
                            },
                        ],
                    },
                    items: [
                        {
                            items: {
                                enum: ["black", "brown", "red", "white"],
                                type: "string",
                            },
                            type: "array",
                        },
                    ],
                    minItems: 1,
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
    ],
}

const setupMessageSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    allOf: [
        {
            additionalItems: {
                anyOf: [
                    {
                        type: "string",
                    },
                    {
                        items: {},
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    type: "string",
                },
                {
                    items: {},
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
        {
            additionalItems: {
                anyOf: [
                    {
                        enum: ["setup"],
                        type: "string",
                    },
                    {
                        additionalItems: {
                            anyOf: [
                                {
                                    $ref: "#/definitions/ExternalState",
                                },
                            ],
                        },
                        items: [
                            {
                                $ref: "#/definitions/ExternalState",
                            },
                        ],
                        minItems: 1,
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    enum: ["setup"],
                    type: "string",
                },
                {
                    additionalItems: {
                        anyOf: [
                            {
                                $ref: "#/definitions/ExternalState",
                            },
                        ],
                    },
                    items: [
                        {
                            $ref: "#/definitions/ExternalState",
                        },
                    ],
                    minItems: 1,
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
    ],
    definitions: {
        ExternalColor: {
            enum: ["black", "brown", "red", "white"],
            type: "string",
        },
        ExternalPlayer: {
            properties: {
                color: {
                    $ref: "#/definitions/ExternalColor",
                },
                places: {
                    items: {
                        additionalItems: {
                            anyOf: [
                                {
                                    type: "number",
                                },
                                {
                                    type: "number",
                                },
                            ],
                        },
                        items: [
                            {
                                type: "number",
                            },
                            {
                                type: "number",
                            },
                        ],
                        minItems: 2,
                        type: "array",
                    },
                    type: "array",
                },
                score: {
                    type: "number",
                },
            },
            type: "object",
        },
        ExternalState: {
            properties: {
                board: {
                    items: {
                        items: {
                            type: "number",
                        },
                        type: "array",
                    },
                    type: "array",
                },
                players: {
                    items: {
                        $ref: "#/definitions/ExternalPlayer",
                    },
                    type: "array",
                },
            },
            type: "object",
        },
    },
}

const takeTurnMessageSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    allOf: [
        {
            additionalItems: {
                anyOf: [
                    {
                        type: "string",
                    },
                    {
                        items: {},
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    type: "string",
                },
                {
                    items: {},
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
        {
            additionalItems: {
                anyOf: [
                    {
                        enum: ["take-turn"],
                        type: "string",
                    },
                    {
                        additionalItems: {
                            anyOf: [
                                {
                                    $ref: "#/definitions/ExternalState",
                                },
                                {
                                    items: {
                                        anyOf: [
                                            {
                                                additionalItems: {
                                                    anyOf: [
                                                        {
                                                            additionalItems: {
                                                                anyOf: [
                                                                    {
                                                                        type:
                                                                            "number",
                                                                    },
                                                                    {
                                                                        type:
                                                                            "number",
                                                                    },
                                                                ],
                                                            },
                                                            items: [
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                            ],
                                                            minItems: 2,
                                                            type: "array",
                                                        },
                                                        {
                                                            additionalItems: {
                                                                anyOf: [
                                                                    {
                                                                        type:
                                                                            "number",
                                                                    },
                                                                    {
                                                                        type:
                                                                            "number",
                                                                    },
                                                                ],
                                                            },
                                                            items: [
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                            ],
                                                            minItems: 2,
                                                            type: "array",
                                                        },
                                                    ],
                                                },
                                                items: [
                                                    {
                                                        additionalItems: {
                                                            anyOf: [
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                            ],
                                                        },
                                                        items: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                        minItems: 2,
                                                        type: "array",
                                                    },
                                                    {
                                                        additionalItems: {
                                                            anyOf: [
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                            ],
                                                        },
                                                        items: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                        minItems: 2,
                                                        type: "array",
                                                    },
                                                ],
                                                minItems: 2,
                                                type: "array",
                                            },
                                            {
                                                enum: [false],
                                                type: "boolean",
                                            },
                                        ],
                                    },
                                    type: "array",
                                },
                            ],
                        },
                        items: [
                            {
                                $ref: "#/definitions/ExternalState",
                            },
                            {
                                items: {
                                    anyOf: [
                                        {
                                            additionalItems: {
                                                anyOf: [
                                                    {
                                                        additionalItems: {
                                                            anyOf: [
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                            ],
                                                        },
                                                        items: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                        minItems: 2,
                                                        type: "array",
                                                    },
                                                    {
                                                        additionalItems: {
                                                            anyOf: [
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                            ],
                                                        },
                                                        items: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                        minItems: 2,
                                                        type: "array",
                                                    },
                                                ],
                                            },
                                            items: [
                                                {
                                                    additionalItems: {
                                                        anyOf: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                    },
                                                    items: [
                                                        {
                                                            type: "number",
                                                        },
                                                        {
                                                            type: "number",
                                                        },
                                                    ],
                                                    minItems: 2,
                                                    type: "array",
                                                },
                                                {
                                                    additionalItems: {
                                                        anyOf: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                    },
                                                    items: [
                                                        {
                                                            type: "number",
                                                        },
                                                        {
                                                            type: "number",
                                                        },
                                                    ],
                                                    minItems: 2,
                                                    type: "array",
                                                },
                                            ],
                                            minItems: 2,
                                            type: "array",
                                        },
                                        {
                                            enum: [false],
                                            type: "boolean",
                                        },
                                    ],
                                },
                                type: "array",
                            },
                        ],
                        minItems: 2,
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    enum: ["take-turn"],
                    type: "string",
                },
                {
                    additionalItems: {
                        anyOf: [
                            {
                                $ref: "#/definitions/ExternalState",
                            },
                            {
                                items: {
                                    anyOf: [
                                        {
                                            additionalItems: {
                                                anyOf: [
                                                    {
                                                        additionalItems: {
                                                            anyOf: [
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                            ],
                                                        },
                                                        items: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                        minItems: 2,
                                                        type: "array",
                                                    },
                                                    {
                                                        additionalItems: {
                                                            anyOf: [
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                                {
                                                                    type:
                                                                        "number",
                                                                },
                                                            ],
                                                        },
                                                        items: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                        minItems: 2,
                                                        type: "array",
                                                    },
                                                ],
                                            },
                                            items: [
                                                {
                                                    additionalItems: {
                                                        anyOf: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                    },
                                                    items: [
                                                        {
                                                            type: "number",
                                                        },
                                                        {
                                                            type: "number",
                                                        },
                                                    ],
                                                    minItems: 2,
                                                    type: "array",
                                                },
                                                {
                                                    additionalItems: {
                                                        anyOf: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                    },
                                                    items: [
                                                        {
                                                            type: "number",
                                                        },
                                                        {
                                                            type: "number",
                                                        },
                                                    ],
                                                    minItems: 2,
                                                    type: "array",
                                                },
                                            ],
                                            minItems: 2,
                                            type: "array",
                                        },
                                        {
                                            enum: [false],
                                            type: "boolean",
                                        },
                                    ],
                                },
                                type: "array",
                            },
                        ],
                    },
                    items: [
                        {
                            $ref: "#/definitions/ExternalState",
                        },
                        {
                            items: {
                                anyOf: [
                                    {
                                        additionalItems: {
                                            anyOf: [
                                                {
                                                    additionalItems: {
                                                        anyOf: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                    },
                                                    items: [
                                                        {
                                                            type: "number",
                                                        },
                                                        {
                                                            type: "number",
                                                        },
                                                    ],
                                                    minItems: 2,
                                                    type: "array",
                                                },
                                                {
                                                    additionalItems: {
                                                        anyOf: [
                                                            {
                                                                type: "number",
                                                            },
                                                            {
                                                                type: "number",
                                                            },
                                                        ],
                                                    },
                                                    items: [
                                                        {
                                                            type: "number",
                                                        },
                                                        {
                                                            type: "number",
                                                        },
                                                    ],
                                                    minItems: 2,
                                                    type: "array",
                                                },
                                            ],
                                        },
                                        items: [
                                            {
                                                additionalItems: {
                                                    anyOf: [
                                                        {
                                                            type: "number",
                                                        },
                                                        {
                                                            type: "number",
                                                        },
                                                    ],
                                                },
                                                items: [
                                                    {
                                                        type: "number",
                                                    },
                                                    {
                                                        type: "number",
                                                    },
                                                ],
                                                minItems: 2,
                                                type: "array",
                                            },
                                            {
                                                additionalItems: {
                                                    anyOf: [
                                                        {
                                                            type: "number",
                                                        },
                                                        {
                                                            type: "number",
                                                        },
                                                    ],
                                                },
                                                items: [
                                                    {
                                                        type: "number",
                                                    },
                                                    {
                                                        type: "number",
                                                    },
                                                ],
                                                minItems: 2,
                                                type: "array",
                                            },
                                        ],
                                        minItems: 2,
                                        type: "array",
                                    },
                                    {
                                        enum: [false],
                                        type: "boolean",
                                    },
                                ],
                            },
                            type: "array",
                        },
                    ],
                    minItems: 2,
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
    ],
    definitions: {
        ExternalColor: {
            enum: ["black", "brown", "red", "white"],
            type: "string",
        },
        ExternalPlayer: {
            properties: {
                color: {
                    $ref: "#/definitions/ExternalColor",
                },
                places: {
                    items: {
                        additionalItems: {
                            anyOf: [
                                {
                                    type: "number",
                                },
                                {
                                    type: "number",
                                },
                            ],
                        },
                        items: [
                            {
                                type: "number",
                            },
                            {
                                type: "number",
                            },
                        ],
                        minItems: 2,
                        type: "array",
                    },
                    type: "array",
                },
                score: {
                    type: "number",
                },
            },
            type: "object",
        },
        ExternalState: {
            properties: {
                board: {
                    items: {
                        items: {
                            type: "number",
                        },
                        type: "array",
                    },
                    type: "array",
                },
                players: {
                    items: {
                        $ref: "#/definitions/ExternalPlayer",
                    },
                    type: "array",
                },
            },
            type: "object",
        },
    },
}

const endMessageSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    allOf: [
        {
            additionalItems: {
                anyOf: [
                    {
                        type: "string",
                    },
                    {
                        items: {},
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    type: "string",
                },
                {
                    items: {},
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
        {
            additionalItems: {
                anyOf: [
                    {
                        enum: ["end"],
                        type: "string",
                    },
                    {
                        additionalItems: {
                            anyOf: [
                                {
                                    type: "boolean",
                                },
                            ],
                        },
                        items: [
                            {
                                type: "boolean",
                            },
                        ],
                        minItems: 1,
                        type: "array",
                    },
                ],
            },
            items: [
                {
                    enum: ["end"],
                    type: "string",
                },
                {
                    additionalItems: {
                        anyOf: [
                            {
                                type: "boolean",
                            },
                        ],
                    },
                    items: [
                        {
                            type: "boolean",
                        },
                    ],
                    minItems: 1,
                    type: "array",
                },
            ],
            minItems: 2,
            type: "array",
        },
    ],
}

export {
    messageSchema,
    startMessageSchema,
    playingAsMessageSchema,
    playingWithMessageSchema,
    setupMessageSchema,
    takeTurnMessageSchema,
    endMessageSchema,
}
