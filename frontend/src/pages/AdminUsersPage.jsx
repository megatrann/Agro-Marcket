import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import adminService from "../services/adminService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/format";
import { useLanguage } from "../context/LanguageContext";

function AdminUsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await adminService.updateUserRole(id, role);
      await fetchUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update user role."));
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete user."));
    }
  };

  if (loading) {
    return <Loader label={t("admin.loadingUsers")} />;
  }

  return (
    <section className="page-card">
      <div className="section-head">
        <h2>{t("admin.userManagement")}</h2>
        <p className="muted">{t("admin.usersCount", { count: users.length })}</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("auth.name")}</th>
              <th>{t("auth.email")}</th>
              <th>{t("auth.role")}</th>
              <th>{t("admin.joined")}</th>
              <th>{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select value={user.role} onChange={(event) => handleRoleChange(user.id, event.target.value)}>
                    <option value="customer">{t("auth.customer")}</option>
                    <option value="farmer">{t("auth.farmer")}</option>
                    <option value="vendor">{t("auth.vendor")}</option>
                    <option value="admin">{t("admin.admin")}</option>
                  </select>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <button type="button" className="btn btn-outline" onClick={() => handleDelete(user.id)}>
                    {t("admin.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminUsersPage;
