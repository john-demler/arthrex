// In-memory message queue with IDs
export type QueueMessage = { id: string; color: string; hex: string };

export const colorHexMap = [
    {
        color: 'red',
        hex: '#FF0000'
    },
    {
        color: 'green',
        hex: '#00FF00'
    },
    {
        color: 'blue',
        hex: '#0000FF'
    },
    {
        color: 'yellow',
        hex: '#FFFF00'
    },
    {
        color: 'purple',
        hex: '#800080'
    }
];
