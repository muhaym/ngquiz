export interface Questions {
    question: string;
    options:  Option[];
}

export interface Option {
    option: string;
    answer: boolean;
}
