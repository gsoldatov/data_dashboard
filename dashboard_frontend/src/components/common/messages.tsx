import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/common/shadcn-ui/card";


interface ErrorProps {
    /** Optional card title. When omitted no header is rendered. */
    header?: string;

    /** Error description rendered inside the card body. */
    message: string;
}


/** Card-styled error display with optional header and message. */
export const Error = ({ header, message }: ErrorProps) => (
    <Card className="border-destructive bg-destructive/5">
        {header && (
            <CardHeader>
                <CardTitle className="text-destructive">{header}</CardTitle>
            </CardHeader>
        )}
        <CardContent className={header ? "" : "pt-6"}>
            <p className="text-destructive">{message}</p>
        </CardContent>
    </Card>
);
