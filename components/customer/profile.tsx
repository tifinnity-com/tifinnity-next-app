"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Profile {
  name: string;
  phone: string;
}

interface Address {
  id?: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
}

export default function ProfileManagement() {
  const [profile, setProfile] = useState<Profile>({ name: "", phone: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<Address>({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    type: "home",
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("users")
        .select("name, phone")
        .eq("id", user?.id)
        .single();
      setProfile(profileData as Profile);

      const { data: addressData } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user?.id);
      setAddresses(addressData as Address[]);
    };
    fetchProfile();
  }, [supabase]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("users")
      .update(profile)
      .eq("id", user?.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("addresses")
      .insert({ ...addressForm, user_id: user?.id });
    if (error) toast.error(error.message);
    else {
      toast.success("Address added for tiffin delivery!");
      setAddressForm({
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        type: "home",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6"
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-orange-600">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate}>
            <Input
              placeholder="Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mb-4"
            />
            <Input
              placeholder="Phone"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="mb-4"
            />
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 w-full"
            >
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAddress} className="mb-6">
            <Input
              placeholder="Address Line 1"
              value={addressForm.address_line1}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  address_line1: e.target.value,
                })
              }
              className="mb-4"
            />
            <Input
              placeholder="Address Line 2"
              value={addressForm.address_line2}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  address_line2: e.target.value,
                })
              }
              className="mb-4"
            />
            <Input
              placeholder="City"
              value={addressForm.city}
              onChange={(e) =>
                setAddressForm({ ...addressForm, city: e.target.value })
              }
              className="mb-4"
            />
            <Input
              placeholder="State"
              value={addressForm.state}
              onChange={(e) =>
                setAddressForm({ ...addressForm, state: e.target.value })
              }
              className="mb-4"
            />
            <Input
              placeholder="Pincode"
              value={addressForm.pincode}
              onChange={(e) =>
                setAddressForm({ ...addressForm, pincode: e.target.value })
              }
              className="mb-4"
            />
            <Select
              value={addressForm.type}
              onValueChange={(value) =>
                setAddressForm({ ...addressForm, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="mess">Mess</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="mt-4 bg-orange-500 hover:bg-orange-600 w-full"
            >
              Add Address
            </Button>
          </form>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">Address</th>
                <th className="border p-2">City</th>
                <th className="border p-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((addr) => (
                <tr key={addr.id}>
                  <td className="border p-2">{addr.address_line1}</td>
                  <td className="border p-2">{addr.city}</td>
                  <td className="border p-2">{addr.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
