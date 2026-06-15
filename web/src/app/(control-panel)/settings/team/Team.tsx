import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Role = "Owner" | "Admin" | "Member"

type Member = {
  id: string
  name: string
  email: string
  role: Role
  avatar_url?: string
}

const initialMembers: Member[] = [
  {
    id: "1",
    name: "Jane Cooper",
    email: "jane@example.com",
    role: "Owner",
  },
  {
    id: "2",
    name: "Cody Fisher",
    email: "cody@example.com",
    role: "Admin",
  },
  {
    id: "3",
    name: "Esther Howard",
    email: "esther@example.com",
    role: "Member",
  },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const roleVariant: Record<Role, "default" | "secondary" | "outline"> = {
  Owner: "default",
  Admin: "secondary",
  Member: "outline",
}

export default function Team() {
  const [members] = useState<Member[]>(initialMembers)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("Member")

  const onInvite = () => {
    if (!email) {
      toast.error("Please enter an email address")
      return
    }
    // TODO: wire to team invite endpoint
    console.log("invite", { email, role })
    toast.success(`Invitation sent to ${email}`)
    setEmail("")
  }

  return (
    <main className="pl-1">
      <header className="border-b p-4">
        <h1 className="text-2xl">Team</h1>
        <p className="text-sm text-muted-foreground">
          Manage your team members and their roles.
        </p>
      </header>
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Invite a member</p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="flex-1"
            />
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onInvite}>
              <Plus />
              Invite
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                        <AvatarFallback>{initials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[member.role]}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={member.role === "Owner"}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  )
}
