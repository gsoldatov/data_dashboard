import {
    Card,
    CardContent,
} from "@/components/common/shadcn-ui/card";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";

/** Card displaying read-only user information (role, joined date). */
export const UserInfo = () => {
    const { data: currentUser } = useGetCurrentUserQuery();

    return (
        <Card className="mb-6">
            <CardContent className="pt-6 text-sm">
                <p>
                    <span className="text-muted-foreground">Role: </span>
                    <span className="font-medium capitalize">
                        {currentUser!.role}
                    </span>
                </p>
                <p>
                    <span className="text-muted-foreground">Joined: </span>
                    <span className="font-medium">
                        {new Date(
                            currentUser!.created_at,
                        ).toLocaleDateString()}
                    </span>
                </p>
            </CardContent>
        </Card>
    );
};
